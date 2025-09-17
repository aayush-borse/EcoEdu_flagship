from app import create_app, db
from app.models import User, Post, Reel, Quiz
from werkzeug.security import generate_password_hash

app = create_app()
with app.app_context():
    if User.query.count() == 0:
        u = User(username='demo', password_hash=generate_password_hash('pass'), avatar=None, points=120)
        db.session.add(u)
        db.session.commit()
        p1 = Post(caption='Protect our rivers', image='/placeholder-environment.jpg', user_id=u.id)
        p2 = Post(caption='Plant trees!', image='/placeholder-environment.jpg', user_id=u.id)
        db.session.add_all([p1,p2])
        r = Reel(caption='Recycling tips', video='https://interactive-examples.mdn.mozilla.net/media/examples/flower.mp4', user_id=u.id)
        db.session.add(r)
        q = Quiz(title='Eco Basics', data={
            'questions': [
                {'text':'What is renewable energy?','options':['Wind','Coal','Gas'],'answer':0},
                {'text':'Which reduces waste?','options':['Reuse','Burn','Dump'],'answer':0}
            ]
        })
        db.session.add(q)
        db.session.commit()
        print('Seeded demo data.')
    else:
        print('Data exists.')
