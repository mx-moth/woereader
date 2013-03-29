from registration.forms import RegistrationForm
from registration.backends.default import DefaultBackend
from captcha.fields import ReCaptchaField


class FormWithCaptcha(RegistrationForm):
    captcha = ReCaptchaField(attrs={'theme': 'blackglass'})


class RecaptchaRegistrationBackend(DefaultBackend):
    def get_form_class(self, request):
        return FormWithCaptcha
