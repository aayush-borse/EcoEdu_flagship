from .models import User, Post, Reel, Quiz, db
from werkzeug.security import generate_password_hash

def insert_dummy_data(db):
    if User.query.count() == 0:
        user1 = User(username='Alice', email='alice@example.com', password=generate_password_hash('1234'), points=10)
        user2 = User(username='Bob', email='bob@example.com', password=generate_password_hash('1234'), points=15)
        db.session.add_all([user1, user2])
        db.session.commit()

    if Post.query.count() == 0:
        db.session.add_all([
            Post(caption='Save the Earth!', user_id=1, likes=5),
            Post(caption='Plant trees today!', user_id=2, likes=8)
        ])
        db.session.commit()

    if Reel.query.count() == 0:
        db.session.add_all([
            Reel(video_url='https://www.w3schools.com/html/mov_bbb.mp4', likes=3),
            Reel(video_url='https://www.w3schools.com/html/movie.mp4', likes=7)
        ])
        db.session.commit()

    if Quiz.query.count() == 0:
        db.session.add_all([
            Quiz(question='Which gas causes global warming?', options=['O2', 'CO2', 'N2'], answer='CO2'),
            Quiz(question='Best way to save water?', options=['Leave taps open', 'Fix leaks', 'Flood'], answer='Fix leaks')
        ])
        db.session.commit()
