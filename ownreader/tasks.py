from celery import task
from ownreader.feeds import UpdateAll, UpdateUser


@task()
def CeleryUpdater(user=None):
    if user is None:
        UpdateAll()
    else:
        UpdateUser(user)
