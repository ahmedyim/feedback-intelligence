import pytest
from unittest.mock import patch
from models.feedback import CategoryEnum


class TestSubmitFeedback:
    def test_submit_with_explicit_category(self, client):
        response = client.post("/api/feedback/", json={
            "customer_name": "Alice Smith",
            "message": "The app crashes on login",
            "category": "Bug",
            "source": "mobile_app",
        })
        assert response.status_code == 201, response.json()
        data = response.json()
        assert data["category"] == "Bug"
        assert data["message"] == "The app crashes on login"

    def test_submit_without_category_triggers_nlp(self, client):
        with patch("routers.feedback.categorize_feedback", return_value=CategoryEnum.FEATURE_REQUEST) as mock_cat:
            response = client.post("/api/feedback/", json={
                "customer_name": "Bob Jones",
                "message": "Please add dark mode",
                "source": "web",
            })
            assert response.status_code == 201, response.json()
            mock_cat.assert_called_once_with("Please add dark mode")
            assert response.json()["category"] == "Feature Request"

    def test_submit_missing_required_field(self, client):
        response = client.post("/api/feedback/", json={
            "customer_name": "Carol Lee",
            "source": "web",
        })
        assert response.status_code == 422

    def test_submit_invalid_category_enum(self, client):
        response = client.post("/api/feedback/", json={
            "customer_name": "Dave Kim",
            "message": "test",
            "source": "web",
            "category": "not_a_real_category",
        })
        assert response.status_code == 422


class TestListFeedback:
    def test_list_default_pagination(self, client):
        response = client.get("/api/feedback/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_list_with_filters(self, client, db_session):
        client.post("/api/feedback/", json={
            "customer_name": "Erin Fox",
            "message": "bug 1",
            "category": "Bug",
            "source": "web",
        })
        client.post("/api/feedback/", json={
            "customer_name": "Frank Diaz",
            "message": "idea 1",
            "category": "Feature Request",
            "source": "mobile_app",
        })

        response = client.get("/api/feedback/", params={"category": "Bug"})
        assert response.status_code == 200, response.json()
        results = response.json()
        assert all(item["category"] == "Bug" for item in results)

    def test_list_search(self, client):
        response = client.post("/api/feedback/", json={
            "customer_name": "Grace Lin",
            "message": "login page is broken",
            "category": "Bug",
            "source": "web",
        })
        assert response.status_code == 201, response.json()

        response = client.get("/api/feedback/", params={"search": "login"})
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_list_pagination_limits(self, client):
        response = client.get("/api/feedback/", params={"limit": 500})
        assert response.status_code == 422

    def test_list_negative_skip_rejected(self, client):
        response = client.get("/api/feedback/", params={"skip": -1})
        assert response.status_code == 422


class TestFeedbackStats:
    def test_stats_returns_expected_shape(self, client):
        response = client.get("/api/feedback/stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_feedback" in data
        assert "category_counts" in data
        assert isinstance(data["category_counts"], dict)

    def test_stats_with_data(self, client):
        r1 = client.post("/api/feedback/", json={
            "customer_name": "Henry Park",
            "message": "bug here",
            "category": "Bug",
            "source": "web",
        })
        r2 = client.post("/api/feedback/", json={
            "customer_name": "Ivy Chen",
            "message": "another bug",
            "category": "Bug",
            "source": "web",
        })
        assert r1.status_code == 201, r1.json()
        assert r2.status_code == 201, r2.json()

        response = client.get("/api/feedback/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["total_feedback"] >= 2
        assert data["category_counts"].get("Bug", 0) >= 2