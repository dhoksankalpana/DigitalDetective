from django.contrib import admin
from .models import Suspect


@admin.register(Suspect)
class SuspectAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "case",
        "age",
        "occupation",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "name",
        "occupation",
        "description",
    )