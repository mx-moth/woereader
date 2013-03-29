import feedparser
from time import mktime
from datetime import datetime


def UpdateItems(url, checked=None, ETag=None):
    if checked:
        d = feedparser.parse(url, modified=checked.utctimetuple())
    elif ETag:
        d = feedparser.parse(url, etag=ETag)
    else:
        d = feedparser.parse(url)
    return d.entries


def ParseFeed(url):
    d = feedparser.parse(url)
    feed = dict()
    feed['invalid'] = []
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
                feed['entries'][index]['title'] = ''
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
