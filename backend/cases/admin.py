from django.contrib import admin
from .models import Case


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = (
        "case_number",
        "title",
        "status",
        "priority",
        "assigned_to",
        "created_by",
        "created_at",
    )

    list_filter = (
        "status",
        "priority",
    )

    search_fields = (
        "case_number",
        "title",
        "description",
        "location",
    )