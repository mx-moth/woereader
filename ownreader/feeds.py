import feedparser
from time import mktime
from datetime import datetime
from django.utils.timezone import now
from ownreader.models import Feed, UserFeed, Item, UserItem
from django.contrib.auth.models import User


def UpdateFeed(feed):
    """Returns the content of a feed given an ownreader Feed item
    If the feed has not been modified, returns nothing.
    """
    if feed.etag:
        d = feedparser.parse(feed.url, etag=feed.etag)
    elif feed.checked:
        d = feedparser.parse(feed.url, modified=feed.checked.utctimetuple())
    else:
        d = feedparser.parse(feed.url)
    if not d.status == 304:
        return ParseFeed(feed.url, d)
    else:
        return None


def UpdateItems(f, data=None):
    """Creates ownreader Item items from an ownreader Feed item,
    so long as that item is not already in the database
    Optionally takes an ParseFeed outputted data collection.
    """
    if data is None:
        data = UpdateFeed(f)
    if data is not None:
        for index in data['entries']:
            i = None
            try:
                i = Item.objects.filter(
                    feed=f
                ).filter(
                    itemId=data['entries'][index]['id'])
            except:
                pass
            if i is None:
                i = Item(feed=f, title=data['entries'][index]['title'],
                         itemId=data['entries'][index]['id'],
                         url=data['entries'][index]['link'],
                         published=data['entries'][index]['updated'],
                         description=data['entries'][index]['description'],
                         content=data['entries'][index]['content'])
                i.save()


def UpdateUserItems(user):
    """Creates ownreader UserItem items if required
    Searches for userfeed__feeds__items without useritems for this user
    If there are any, a useritem is made
    """
    itemsToUpdate = Item.objects.all().exclude(
        users=user
    ).filter(
        feed__users=user)
    for item in itemsToUpdate:
        ui = UserItem(user=user, item=item)
        ui.save()


def ParseFeed(url, d=None):
    """Creates ParseFeed data collection from a url
    Optionally takes a feedparser d object
    """
    if not d:
        d = feedparser.parse(url)
    feed = dict()
    feed['invalid'] = []
    if hasattr(d, 'etag'):
        feed['etag'] = d.etag
    if hasattr(d.feed, 'title'):
        feed['title'] = d.feed.title
    else:
        feed['invalid'].append('title')
    if hasattr(d.feed, 'description'):
        feed['description'] = d.feed.description
    else:
        feed['description'] = ''
    if hasattr(d.feed, 'url'):
        feed['url'] = url
    else:
        feed['url'] = url
    if hasattr(d, 'modified_parsed'):
        try:
            feed['updated'] = datetime.fromtimestamp(
                mktime(d.modified_parsed))
        except:
            pass
    elif hasattr(d.feed, 'published_parsed'):
        try:
            feed['updated'] = datetime.fromtimestamp(
                mktime(d.feed.published_parsed))
        except:
            pass
    elif hasattr(d.feed, 'updated_parsed'):
        try:
            feed['updated'] = datetime.fromtimestamp(
                mktime(d.feed.updated_parsed))
        except:
            pass
    elif hasattr(d, 'updated_parsed'):
        try:
            feed['updated'] = datetime.fromtimestamp(
                mktime(d.updated_parsed))
        except:
            pass
    if not hasattr(feed, 'updated'):
        feed['updated'] = datetime.now()
    feed['entries'] = {}
    if hasattr(d, 'entries'):
        for index, item in enumerate(d.entries):
            feed['entries'][index] = {}
            if not hasattr(item, 'title'):
                feed['entries'][index]['title'] = '(No Title)'
            else:
                feed['entries'][index]['title'] = item.title
            if not hasattr(item, 'link'):
                feed['entries'][index]['link'] = feed['title'] + item.title
            else:
                feed['entries'][index]['link'] = item.link
            if not hasattr(item, 'id'):
                feed['entries'][index]['id'] = item.link
            else:
                feed['entries'][index]['id'] = item.id
            try:
                feed['entries'][index]['updated'] = datetime.fromtimestamp(
                    mktime(item.updated_parsed))
            except:
                pass
            try:
                feed['entries'][index]['updated'] = datetime.fromtimestamp(
                    mktime(item.published_parsed))
            except:
                pass
            if not 'updated' in feed['entries'][index]:
                feed['entries'][index]['updated'] = datetime(1970, 1, 1)
            if not hasattr(item, 'description'):
                feed['entries'][index]['description'] = ''
            else:
                feed['entries'][index]['description'] = item.description
            if not hasattr(item, 'content'):
                feed['entries'][index]['content'] = ''
            else:
                feed['entries'][index]['content'] = item.content
            if hasattr(item, 'summary'):
                feed['entries'][index]['content'] = item.summary
    feed['other'] = d
    return feed


def AddFeed(feed, user):
    """Creates Feed and/or UserFeed items given a URL and user
    """
    f = None
    try:
        f = Feed.objects.get(url=feed)
        UpdateItems(f)
    except:
        pass
    if f is None:
        feed = ParseFeed(feed)
        f = Feed(title=feed['title'],
                 url=feed['url'],
                 updated=feed['updated'],
                 checked=now())
        if hasattr(feed, 'etag'):
            f.etag = feed['etag']
        f.save()
        UpdateItems(f, feed)
    try:
        uf = UserFeed.objects.get(user=user, feed=f)
    except:
        uf = None
    if not uf:
        uf = UserFeed(user=user, feed=f)
        uf.save()
    UpdateUserItems(user)


def UpdateAll():
    feedsToUpdate = Feed.objects.all()
    for feed in feedsToUpdate:
        UpdateItems(feed)
    usersToUpdate = User.objects.all()
    for user in usersToUpdate:
        UpdateUserItems(user)
