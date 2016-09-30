from django.core.management.base import BaseCommand

from automation.tests.factory import (
    create_automations, create_automation_filters, create_automation_events,
    create_automation_action_types, create_automation_actions)


class Command(BaseCommand):
    help = 'create test tickets'

    def handle(self, *args, **options):
        create_automation_events()
        create_automation_action_types()
        create_automation_filters()
        create_automations()
        create_automation_actions()
