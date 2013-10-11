from registration.forms import RegistrationForm
from captcha.fields import ReCaptchaField


class FormWithCaptcha(RegistrationForm):
    captcha = ReCaptchaField(attrs={'theme': 'blackglass'})
