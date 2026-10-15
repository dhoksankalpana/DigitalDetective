"""
URL configuration for config project.
"""

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

from rest_framework.routers import DefaultRouter

from cases.views import (
    CaseViewSet,
    DashboardStatsView,
    CaseProgressView,
    CaseAnalyticsView,
    CaseReportView,
    CrimeScenePositionViewSet,
)

from evidence.views import EvidenceViewSet
from suspects.views import SuspectViewSet

from investigations.views import (
    InvestigationViewSet,
    ClueViewSet,
    TimelineEventViewSet,
    CaseNoteViewSet,
    InvestigationTaskViewSet,
)

from notifications.views import NotificationViewSet


router = DefaultRouter()


router.register(
    "cases",
    CaseViewSet,
    basename="case"
)


router.register(
    "evidence",
    EvidenceViewSet,
    basename="evidence"
)


router.register(
    "suspects",
    SuspectViewSet,
    basename="suspect"
)


router.register(
    "investigations",
    InvestigationViewSet,
    basename="investigation"
)


router.register(
    "tasks",
    InvestigationTaskViewSet,
    basename="investigation-task"
)


router.register(
    "clues",
    ClueViewSet,
    basename="clue"
)


router.register(
    "timeline",
    TimelineEventViewSet,
    basename="timeline"
)


router.register(
    "notes",
    CaseNoteViewSet,
    basename="note"
)


router.register(
    "notifications",
    NotificationViewSet,
    basename="notification"
)
router.register(
    "scene-positions",
    CrimeScenePositionViewSet,
    basename="scene-position"
)


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("accounts.urls")
    ),

    path(
        "api/dashboard/stats/",
        DashboardStatsView.as_view(),
        name="dashboard-stats",
    ),

    path(
        "api/cases/analytics/",
        CaseAnalyticsView.as_view(),
        name="case-analytics",
    ),

    path(
        "api/cases/<int:pk>/progress/",
        CaseProgressView.as_view(),
        name="case-progress",
    ),

    path(
        "api/",
        include(router.urls)
    ),
    path(
    "api/cases/<int:pk>/report/",
    CaseReportView.as_view(),
    name="case-report",
),
]


if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )