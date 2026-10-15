from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

from .models import Case
from .serializers import CaseSerializer
from .models import CrimeScenePosition
from .serializers import CrimeScenePositionSerializer
from evidence.models import Evidence
from suspects.models import Suspect
from investigations.models import (
    Investigation,
    Clue,
    TimelineEvent,
    InvestigationTask,
)
from notifications.models import Notification



class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all().order_by("-created_at")
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        total_cases = Case.objects.count()

        open_cases = Case.objects.filter(
            status__in=["open", "active", "in_progress"]
        ).count()

        closed_cases = Case.objects.filter(
            status__in=["closed", "resolved"]
        ).count()

        high_priority_cases = Case.objects.filter(
            priority="high"
        ).count()

        medium_priority_cases = Case.objects.filter(
            priority="medium"
        ).count()

        low_priority_cases = Case.objects.filter(
            priority="low"
        ).count()

        total_evidence = Evidence.objects.count()

        verified_evidence = Evidence.objects.filter(
            verified=True
        ).count()

        unverified_evidence = Evidence.objects.filter(
            verified=False
        ).count()

        total_suspects = Suspect.objects.count()

        total_investigations = Investigation.objects.count()

        total_clues = Clue.objects.count()

        resolved_clues = Clue.objects.filter(
            resolved=True
        ).count()

        unresolved_clues = Clue.objects.filter(
            resolved=False
        ).count()

        total_tasks = InvestigationTask.objects.count()

        completed_tasks = InvestigationTask.objects.filter(
            status="completed"
        ).count()

        in_progress_tasks = InvestigationTask.objects.filter(
            status="in_progress"
        ).count()

        pending_tasks = InvestigationTask.objects.filter(
            status="pending"
        ).count()

        cancelled_tasks = InvestigationTask.objects.filter(
            status="cancelled"
        ).count()

        return Response({
            "cases": {
                "total": total_cases,
                "open": open_cases,
                "closed": closed_cases,
                "high_priority": high_priority_cases,
                "medium_priority": medium_priority_cases,
                "low_priority": low_priority_cases,
            },

            "evidence": {
                "total": total_evidence,
                "verified": verified_evidence,
                "unverified": unverified_evidence,
            },

            "suspects": {
                "total": total_suspects,
            },

            "investigations": {
                "total": total_investigations,
            },

            "clues": {
                "total": total_clues,
                "resolved": resolved_clues,
                "unresolved": unresolved_clues,
            },

            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "in_progress": in_progress_tasks,
                "pending": pending_tasks,
                "cancelled": cancelled_tasks,
            },
        })


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_cases = Case.objects.filter(
            status__in=["open", "pending"]
        ).count()

        total_cases = Case.objects.count()

        total_evidence = Evidence.objects.count()

        verified_evidence = Evidence.objects.filter(
            verified=True
        ).count()

        total_suspects = Suspect.objects.count()

        unresolved_clues = Clue.objects.filter(
            resolved=False
        ).count()

        resolved_clues = Clue.objects.filter(
            resolved=True
        ).count()

        total_investigations = request.user.investigations.count()

        unread_notifications = Notification.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response({
            "active_cases": active_cases,
            "total_cases": total_cases,
            "total_evidence": total_evidence,
            "verified_evidence": verified_evidence,
            "total_suspects": total_suspects,
            "unresolved_clues": unresolved_clues,
            "resolved_clues": resolved_clues,
            "total_investigations": total_investigations,
            "unread_notifications": unread_notifications,
        })


class CaseProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response(
                {
                    "detail": "Case not found."
                },
                status=404
            )

        investigations_count = Investigation.objects.filter(
            case=case
        ).count()

        evidence_count = Evidence.objects.filter(
            case=case
        ).count()

        suspects_count = Suspect.objects.filter(
            case=case
        ).count()

        clues_count = Clue.objects.filter(
            case=case
        ).count()

        resolved_clues_count = Clue.objects.filter(
            case=case,
            resolved=True
        ).count()

        timeline_count = TimelineEvent.objects.filter(
            case=case
        ).count()

        completed_tasks_count = InvestigationTask.objects.filter(
            case=case,
            status="completed"
        ).count()

        total_tasks_count = InvestigationTask.objects.filter(
            case=case
        ).count()

        case_resolved = case.status in [
            "resolved",
            "closed",
            "completed"
        ]

        stages = [
            {
                "id": "case_created",
                "name": "Case Created",
                "description": "Investigation case has been created.",
                "completed": True,
            },
            {
                "id": "investigation",
                "name": "Investigation",
                "description": "Investigation activity has been recorded.",
                "completed": investigations_count > 0,
            },
            {
                "id": "evidence",
                "name": "Evidence Collection",
                "description": "Evidence has been added to the case.",
                "completed": evidence_count > 0,
            },
            {
                "id": "suspects",
                "name": "Suspect Analysis",
                "description": "Suspect information has been added.",
                "completed": suspects_count > 0,
            },
            {
                "id": "clues",
                "name": "Clue Investigation",
                "description": "Clues have been investigated and resolved.",
                "completed": (
                    clues_count > 0
                    and resolved_clues_count == clues_count
                ),
            },
            {
                "id": "timeline",
                "name": "Timeline Development",
                "description": "Timeline events have been recorded.",
                "completed": timeline_count > 0,
            },
            {
                "id": "tasks",
                "name": "Investigation Tasks",
                "description": "Investigation tasks have been completed.",
                "completed": (
                    total_tasks_count > 0
                    and completed_tasks_count == total_tasks_count
                ),
            },
            {
                "id": "resolution",
                "name": "Case Resolution",
                "description": "The case has been resolved or closed.",
                "completed": case_resolved,
            },
        ]

        completed_stages = sum(
            1
            for stage in stages
            if stage["completed"]
        )

        total_stages = len(stages)

        progress = round(
            (completed_stages / total_stages) * 100
        )

        return Response({
            "case_id": case.id,
            "case_number": case.case_number,
            "case_title": case.title,
            "case_status": case.status,
            "progress": progress,
            "completed_stages": completed_stages,
            "total_stages": total_stages,
            "investigations_count": investigations_count,
            "evidence_count": evidence_count,
            "suspects_count": suspects_count,
            "clues_count": clues_count,
            "resolved_clues_count": resolved_clues_count,
            "timeline_count": timeline_count,
            "total_tasks_count": total_tasks_count,
            "completed_tasks_count": completed_tasks_count,
            "stages": stages,
        })
class CaseAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_cases = Case.objects.count()

        open_cases = Case.objects.filter(
            status__in=["open", "pending", "active", "in_progress"]
        ).count()

        closed_cases = Case.objects.filter(
            status__in=["closed", "resolved", "completed"]
        ).count()

        high_priority_cases = Case.objects.filter(
            priority="high"
        ).count()

        medium_priority_cases = Case.objects.filter(
            priority="medium"
        ).count()

        low_priority_cases = Case.objects.filter(
            priority="low"
        ).count()

        total_evidence = Evidence.objects.count()

        verified_evidence = Evidence.objects.filter(
            verified=True
        ).count()

        unverified_evidence = Evidence.objects.filter(
            verified=False
        ).count()

        total_suspects = Suspect.objects.count()

        total_investigations = Investigation.objects.count()

        total_clues = Clue.objects.count()

        resolved_clues = Clue.objects.filter(
            resolved=True
        ).count()

        unresolved_clues = Clue.objects.filter(
            resolved=False
        ).count()

        total_tasks = InvestigationTask.objects.count()

        completed_tasks = InvestigationTask.objects.filter(
            status="completed"
        ).count()

        pending_tasks = InvestigationTask.objects.filter(
            status="pending"
        ).count()

        in_progress_tasks = InvestigationTask.objects.filter(
            status="in_progress"
        ).count()

        cancelled_tasks = InvestigationTask.objects.filter(
            status="cancelled"
        ).count()

        return Response({
            "cases": {
                "total": total_cases,
                "open": open_cases,
                "closed": closed_cases,
                "high_priority": high_priority_cases,
                "medium_priority": medium_priority_cases,
                "low_priority": low_priority_cases,
            },

            "evidence": {
                "total": total_evidence,
                "verified": verified_evidence,
                "unverified": unverified_evidence,
            },

            "suspects": {
                "total": total_suspects,
            },

            "investigations": {
                "total": total_investigations,
            },

            "clues": {
                "total": total_clues,
                "resolved": resolved_clues,
                "unresolved": unresolved_clues,
            },

            "tasks": {
                "total": total_tasks,
                "completed": completed_tasks,
                "pending": pending_tasks,
                "in_progress": in_progress_tasks,
                "cancelled": cancelled_tasks,
            },
        })

class CaseReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            case = Case.objects.get(pk=pk)
        except Case.DoesNotExist:
            return Response(
                {
                    "detail": "Case not found."
                },
                status=404
            )

        evidence = Evidence.objects.filter(
            case=case
        ).order_by("-created_at")

        suspects = Suspect.objects.filter(
            case=case
        ).order_by("-created_at")

        investigations = Investigation.objects.filter(
            case=case
        ).order_by("-created_at")

        clues = Clue.objects.filter(
            case=case
        ).order_by("-created_at")

        timeline = TimelineEvent.objects.filter(
            case=case
        ).order_by("event_date")

        tasks = InvestigationTask.objects.filter(
            case=case
        ).order_by("-created_at")

        progress_response = CaseProgressView().get(
            request,
            pk
        )

        progress_data = progress_response.data

        evidence_data = []

        for item in evidence:
            evidence_data.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "evidence_type": item.evidence_type,
                "verified": item.verified,
                "file_hash": item.file_hash,
                "collected_by": (
                    item.collected_by.username
                    if item.collected_by
                    else None
                ),
                "created_at": item.created_at,
            })

        suspect_data = []

        for item in suspects:
            suspect_data.append({
                "id": item.id,
                "name": item.name,
                "age": item.age,
                "occupation": item.occupation,
                "status": item.status,
                "description": item.description,
                "created_at": item.created_at,
            })

        investigation_data = []

        for item in investigations:
            investigation_data.append({
                "id": item.id,
                "title": item.title,
                "findings": item.findings,
                "investigator": (
                    item.investigator.username
                    if item.investigator
                    else None
                ),
                "created_at": item.created_at,
                "updated_at": item.updated_at,
            })

        clue_data = []

        for item in clues:
            clue_data.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "importance": item.importance,
                "resolved": item.resolved,
                "created_at": item.created_at,
            })

        timeline_data = []

        for item in timeline:
            timeline_data.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "event_date": item.event_date,
                "created_at": item.created_at,
            })

        task_data = []

        for item in tasks:
            task_data.append({
                "id": item.id,
                "title": item.title,
                "description": item.description,
                "priority": item.priority,
                "status": item.status,
                "due_date": item.due_date,
                "assigned_to": (
                    item.assigned_to.username
                    if item.assigned_to
                    else None
                ),
                "created_at": item.created_at,
                "completed_at": item.completed_at,
            })

        return Response({
            "report": {
                "generated_at": timezone.now(),
                "generated_by": request.user.username,
            },

            "case": {
                "id": case.id,
                "case_number": case.case_number,
                "title": case.title,
                "description": case.description,
                "location": case.location,
                "status": case.status,
                "priority": case.priority,
                "created_at": case.created_at,
                "updated_at": case.updated_at,
                "created_by": (
                    case.created_by.username
                    if case.created_by
                    else None
                ),
                "assigned_to": (
                    case.assigned_to.username
                    if case.assigned_to
                    else None
                ),
            },

            "progress": progress_data,

            "summary": {
                "evidence_count": evidence.count(),
                "verified_evidence_count": evidence.filter(
                    verified=True
                ).count(),
                "suspect_count": suspects.count(),
                "investigation_count": investigations.count(),
                "clue_count": clues.count(),
                "resolved_clue_count": clues.filter(
                    resolved=True
                ).count(),
                "timeline_event_count": timeline.count(),
                "task_count": tasks.count(),
                "completed_task_count": tasks.filter(
                    status="completed"
                ).count(),
            },

            "evidence": evidence_data,
            "suspects": suspect_data,
            "investigations": investigation_data,
            "clues": clue_data,
            "timeline": timeline_data,
            "tasks": task_data,
        })
class CrimeScenePositionViewSet(viewsets.ModelViewSet):
    serializer_class = CrimeScenePositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = CrimeScenePosition.objects.filter(
            user=self.request.user
        ).select_related("case")

        case_id = self.request.query_params.get("case")

        if case_id:
            queryset = queryset.filter(case_id=case_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)