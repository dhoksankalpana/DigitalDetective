from django.contrib import admin
from .models import Investigation, Clue, TimelineEvent, CaseNote


@admin.register(Investigation)
class InvestigationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "case",
        "investigator",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "title",
        "findings",
        "case__title",
    )


@admin.register(Clue)
class ClueAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "case",
        "importance",
        "resolved",
        "created_at",
    )

    list_filter = (
        "resolved",
        "importance",
    )

    search_fields = (
        "title",
        "description",
        "case__title",
    )


@admin.register(TimelineEvent)
class TimelineEventAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "case",
        "event_date",
        "created_at",
    )

    list_filter = (
        "event_date",
    )

    search_fields = (
        "title",
        "description",
        "case__title",
    )


@admin.register(CaseNote)
class CaseNoteAdmin(admin.ModelAdmin):
    list_display = (
        "case",
        "author",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "content",
        "case__title",
        "author__username",
    )