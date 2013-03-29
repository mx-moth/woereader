from django import forms
from django.contrib.formtools.preview import FormPreview
from ownreader.models import Feed, UserFeed, Item, UserItem
from ownreader.feeds import ParseFeed
from django.shortcuts import redirect


class AddFeedForm(forms.Form):
    feed = forms.URLField(label="Feed URL:")

    def clean_feed(self):
        feed = self.cleaned_data['feed']
        validate = ParseFeed(feed)
        if validate['invalid']:
            reason = ''.join(validate['invalid'])
            raise forms.ValidationError("No valid feed at URL provided " +
                                        reason)
        return feed


class AddFeedFormPreview(FormPreview):
    preview_template = 'ownreader/feed.html'
    form_template = 'ownreader/feed_form.html'

    def process_preview(self, request, form, context):
        context['parsed'] = ParseFeed(form.cleaned_data['feed'])

    def done(self, request, cleaned_data):
        feed = ParseFeed(cleaned_data['feed'])
        f = Feed(title=feed['title'], url=feed['url'], updated=feed['updated'])
        f.save()
        uf = UserFeed(user=request.user, feed=f,
                      customTitle=feed['title'],
                      customDescription=feed['description'])
        uf.save()
        for index in feed['entries']:
            i = Item(feed=f, title=feed['entries'][index]['title'],
                     itemId=feed['entries'][index]['id'],
                     url=feed['entries'][index]['link'],
                     published=feed['entries'][index]['updated'],
                     description=feed['entries'][index]['description'],
                     content=feed['entries'][index]['content'])
            i.save()
            ui = UserItem(bookmarked=False, user=request.user, item=i)
            ui.save()
        return redirect('/')
