from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now


class Feed(models.Model):
    title = models.CharField(max_length=1000)
    description = models.CharField(max_length=1000)
    url = models.URLField(unique=True)
    updated = models.DateTimeField(default=now())
    checked = models.DateTimeField(default=now())
    etag = models.CharField(blank=True, max_length=500)
    users = models.ManyToManyField(User, through='UserFeed')


class UserFeed(models.Model):
    user = models.ForeignKey(User)
    feed = models.ForeignKey(Feed)
    customTitle = models.CharField(max_length=500)
    customDescription = models.CharField(max_length=1000)


class Item(models.Model):
    feed = models.ForeignKey(Feed)
    title = models.CharField(max_length=1000)
    itemId = models.CharField(max_length=255, unique=True)
    url = models.URLField()
    published = models.DateTimeField(default=now())
    description = models.TextField()
    content = models.TextField()
    users = models.ManyToManyField(User, through='UserItem')


class UserItem(models.Model):
    bookmarked = models.BooleanField(default=False)
    read = models.BooleanField(default=False)
    user = models.ForeignKey(User)
    item = models.ForeignKey(Item)


class Folder(models.Model):
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=200)
    user = models.ForeignKey(User)
    feeds = models.ManyToManyField(UserFeed)


class UserPrefs(models.Model):
    user = models.ForeignKey(User)
    showRead = models.BooleanField(default=False)
    showSidebar = models.BooleanField(default=True)
    COLLAPSED = 'CO'
    EXPANDED = 'EX'
    TALL = 'TA'
    WIDE = 'WI'
    VIEWMODE_CHOICES = ((COLLAPSED, 'Collapsed'),
                        (EXPANDED, 'Expanded'),
                        (TALL, 'Tall'),
                        (WIDE, 'Wide'),)
    viewMode = models.CharField(max_length=2,
                                choices=VIEWMODE_CHOICES,
                                default=EXPANDED)
    ITEMNUMBER_CHOICES = map(
        lambda x:(x,x),[10,20,25,30,40,50,60,70,75,80,90,100])
    itemsPerPage = models.IntegerField(choices=ITEMNUMBER_CHOICES, default=25)
