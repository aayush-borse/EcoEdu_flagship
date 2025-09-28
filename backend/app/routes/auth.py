from flask import Blueprint, redirect, url_for, session, current_app
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import create_access_token
from ..models import User, db

auth_bp = Blueprint("auth", __name__)
oauth = OAuth()

# Register Google OAuth
oauth.register(
    name='google',
    client_id='GOOGLE_CLIENT_ID',
    client_secret='GOOGLE_CLIENT_SECRET',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    api_base_url='https://www.googleapis.com/oauth2/v1/',
    userinfo_endpoint='https://www.googleapis.com/oauth2/v1/userinfo',
    client_kwargs={'scope': 'openid email profile'},
)

# Register GitHub OAuth
oauth.register(
    name='github',
    client_id='GITHUB_CLIENT_ID',
    client_secret='GITHUB_CLIENT_SECRET',
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)


@auth_bp.route("/oauth/<provider>")
def oauth_login(provider):
    if provider not in ['google', 'github']:
        return {"msg": "Provider not supported"}, 400

    redirect_uri = url_for('auth.oauth_callback', provider=provider, _external=True)
    return oauth.create_client(provider).authorize_redirect(redirect_uri)


@auth_bp.route("/oauth/<provider>/callback")
def oauth_callback(provider):
    try:
        client = oauth.create_client(provider)
        token = client.authorize_access_token()

        if provider == 'google':
            user_info = client.get('userinfo').json()
            email = user_info.get('email')
            username = user_info.get('name') or email.split("@")[0]

        elif provider == 'github':
            user_info = client.get('user').json()
            email = user_info.get('email')

            # If email not public, fetch primary email
            if not email:
                emails = client.get('user/emails').json()
                email = next((e['email'] for e in emails if e.get('primary')), None)

            username = user_info.get('login') or (email.split("@")[0] if email else "github_user")

        else:
            return {"msg": "Unsupported provider"}, 400

        if not email:
            return {"msg": "Email not found from provider"}, 400

        # Check if user exists
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(username=username, email=email, password="")
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=user.id)

        # Redirect to frontend with token
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:3000")
        return redirect(f"{frontend_url}/login/success?token={access_token}")

    except Exception as e:
        current_app.logger.error(f"OAuth callback error ({provider}): {e}")
        return {"msg": "Internal server error"}, 500
