from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_health() -> None:
    res = client.get('/api/health')
    assert res.status_code == 200
    assert res.json() == {'status': 'ok'}


def test_cross_endpoint_mrr_arr_and_customer_consistency() -> None:
    overview = client.get('/api/overview', params={'date_range': 'Last 6 Months'}).json()
    revenue = client.get('/api/revenue', params={'date_range': 'Last 6 Months'}).json()
    growth = client.get('/api/growth', params={'date_range': 'Last 6 Months'}).json()
    active_list = client.get(
        '/api/customers',
        params={'date_range': 'Last 6 Months', 'status': 'Active', 'page_size': 200},
    ).json()

    active_mrr_sum = sum(c['mrr'] for c in active_list['items'])
    assert overview['mrr'] == revenue['mrr'] == active_mrr_sum
    assert overview['arr'] == overview['mrr'] * 12
    assert revenue['arr'] == revenue['mrr'] * 12
    assert overview['totalCustomers'] == growth['activeCustomers'] == active_list['total']

    assert sum(s['amount'] for s in overview['planSlices']) == overview['mrr']
    assert sum(s['amount'] for s in revenue['planSlices']) == revenue['mrr']
    assert sum(r['mrr'] for r in revenue['planPerformance']) == revenue['mrr']
    for row in revenue['planPerformance']:
        assert row['arr'] == row['mrr'] * 12


def test_retention_and_growth_accounting_rules() -> None:
    for date_range in ('Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Last 6 Months', 'Last 12 Months'):
        overview = client.get('/api/overview', params={'date_range': date_range}).json()
        retention = client.get('/api/retention', params={'date_range': date_range}).json()
        growth = client.get('/api/growth', params={'date_range': date_range}).json()

        assert overview['churnRate'] == retention['churnRate']
        assert round(retention['churnRate'] + retention['retentionRate'], 1) == 100.0
        assert retention['lostCustomers'] == growth['lostCustomers']
        assert retention['newCustomers'] == growth['newCustomers']
        assert growth['netGrowth'] == growth['newCustomers'] - growth['lostCustomers']

        for row in growth['planGrowth']:
            assert row['startCustomers'] + row['newCustomers'] - row['lostCustomers'] == row['endCustomers']
            assert row['netGrowth'] == row['newCustomers'] - row['lostCustomers']


def test_custom_date_range_filtering_and_validation() -> None:
    # Valid subset window ending in April 2024
    apr = client.get(
        '/api/overview',
        params={
            'date_range': 'Custom Date Range',
            'start_date': '2024-01-01',
            'end_date': '2024-04-30',
        },
    )
    assert apr.status_code == 200
    apr_data = apr.json()
    assert len(apr_data['revenueSeries']) == 4
    assert apr_data['arr'] == apr_data['mrr'] * 12

    # Inverted range -> 400
    bad_order = client.get(
        '/api/overview',
        params={
            'date_range': 'Custom Date Range',
            'start_date': '2024-06-01',
            'end_date': '2024-02-01',
        },
    )
    assert bad_order.status_code == 400

    # Invalid date string -> 400
    bad_fmt = client.get(
        '/api/revenue',
        params={
            'date_range': 'Custom Date Range',
            'start_date': '2024-02-31',
            'end_date': '2024-04-01',
        },
    )
    assert bad_fmt.status_code == 400

    # Out-of-bounds range returns clean empty series without crashing
    empty_res = client.get(
        '/api/growth',
        params={
            'date_range': 'Custom Date Range',
            'start_date': '2025-01-01',
            'end_date': '2025-02-01',
        },
    )
    assert empty_res.status_code == 200
    assert empty_res.json()['growthTrend'] == []


def test_customer_search_filter_sort_pagination_and_detail() -> None:
    # Search by name/email (case-insensitive)
    search_res = client.get('/api/customers', params={'search': 'NOVA'})
    assert search_res.status_code == 200
    items = search_res.json()['items']
    assert len(items) == 1
    assert items[0]['name'] == 'Nova Systems'

    # Combined plan + status filter + sort by MRR desc
    filtered = client.get(
        '/api/customers',
        params={'plan': 'Pro', 'status': 'Past Due', 'sort_by': 'mrr', 'sort_dir': 'desc'},
    ).json()
    assert filtered['total'] == 2
    assert [c['name'] for c in filtered['items']] == ['RelayDesk', 'LumenStack']

    # Pagination
    p1 = client.get('/api/customers', params={'page': 1, 'page_size': 7}).json()
    p2 = client.get('/api/customers', params={'page': 2, 'page_size': 7}).json()
    assert len(p1['items']) == 7
    assert len(p2['items']) == 7
    assert p1['items'][0]['id'] != p2['items'][0]['id']

    # Detail endpoint 200 & 404
    detail_ok = client.get('/api/customers/cust-001')
    assert detail_ok.status_code == 200
    assert detail_ok.json()['name'] == 'Acme Tech'

    detail_404 = client.get('/api/customers/does-not-exist')
    assert detail_404.status_code == 404
