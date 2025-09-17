from . import ma
from .models import User, Post, Reel, Quiz, QuizResult

class UserSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_relationships = True

class PostSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Post
        include_fk = True
        

class ReelSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Reel
        include_fk = True

class QuizSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Quiz

class QuizResultSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = QuizResult

user_schema = UserSchema()
users_schema = UserSchema(many=True)

post_schema = PostSchema()
posts_schema = PostSchema(many=True)

reel_schema = ReelSchema()
reels_schema = ReelSchema(many=True)

quiz_schema = QuizSchema()
quizzes_schema = QuizSchema(many=True)

quiz_result_schema = QuizResultSchema()
quiz_results_schema = QuizResultSchema(many=True)
