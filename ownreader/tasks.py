from celery import task
from ownreader.feeds import UpdateAll


@task()
def CeleryUpdater():
    UpdateAll()
