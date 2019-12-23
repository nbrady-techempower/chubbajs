# ChubbaJS (pronounced gif)

ChubbaJS is a very opinionated JS framework built on top of
express to help you prototype applications quickly. This does
not mean it can't be used it production, but I built it, and
I'm saying you probably shouldn't... right now.

### What's with the name?

Chubba is a nickname my wife and I gave to our toddler. He's
actually not that chubby, but he is very opinionated. For instance,
he chooses to only work with Postgres, so you're going to have to deal
with it.

### What's this thing do, though?

ChubbaJS has an opinionated folder structure. Using this structure,
it will register all of your routes for you, and even run migrations.
You read that right. No migrations. Point it at a database, build some
models in your `/models` folder, and ChubbaJS will take care of the migrations.

### So, it's an ORM?

Settle down. You're an ORM!

No, it's not a full-featured ORM. It uses `postgres-node (pg)` under
the hood, and does give you a few extra features (like a `save` method)
on top of the classes you'll build for your models.

### Why do I even need this?

You probably don't. I didn't build it for you. I built it for me.l
I hate writing migrations. I hate running migrations. Sometimes I get
an app idea, and I just want to start writing it in JavaScript. Now, I 
can do that. I just create a database in Postgres, update my config, and
then start coding. If I have a `User` model, and I need to add a new
field in the database, I simply add a new annotated instance variable to
the `User` class and *poof*, ChubbaJS will run that migration.

### Sweet, so I can use this in production?

No, I already said don't do that. You never listen! There are still
a lot of things to be flushed out, which is why I wrote this specifically
for quickly prototyping apps. It only does up migrations right now and
it doesn't handle other things like optimistic locking, etc, on its own.
I want it to do that. Until then, it's not ready for production.

### I want to name an instance variable one thing, but name the table something else. Can I do that?

ChubbaJS is opinionated and he says, "No! Grow up! Stop over-
engineering and just name it one way."

## Let's Get Technical

