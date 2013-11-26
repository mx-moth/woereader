from __future__ import absolute_import
from celery.task import task
from ownreader.feeds import UpdateFeed, UpdateItems, UpdateUserItems
from ownreader.models import Feed
from django.contrib.auth.models import User


@task(ignore_result=True)
def CeleryUpdater(user=None):
    if user is None:
        feedsToUpdate = Feed.objects.all()
        usersToUpdate = User.objects.all()
    else:
        feedsToUpdate = Feed.objects.filter(users=user)
        usersToUpdate = [user]

    for feed in feedsToUpdate:
        UpdateItems(feed)
    for user in usersToUpdate:
        UpdateUserItems(user)
