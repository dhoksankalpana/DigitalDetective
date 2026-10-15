from django.contrib import admin
from .models import Evidence


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "case",
        "evidence_type",
        "verified",
        "collected_by",
        "created_at",
    )

    list_filter = (
        "evidence_type",
        "verified",
    )

    search_fields = (
        "title",
        "description",
    )