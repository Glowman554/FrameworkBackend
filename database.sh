createuser -U postgres --pwprompt framework
createdb -U postgres --encoding=UTF8 --locale=C --template=template0 --owner=framework framework
