from flask import Flask, request
from flask_cors import CORS, cross_origin
from sqlalchemy.orm import sessionmaker
from database import engine
from schema import Base, Note
from migration import migrations

Base.metadata.create_all(engine)  
Session = sessionmaker(bind=engine)
session = Session()

### Initialise l'application Flask
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

### Lance les migrations
migrations() 

    
### Route pour récupérer une note
@app.get("/getNote/<int:id>")
def getNote(id):
    note = session.query(Note).get(id)
    if note is not None: 
        return responseType(200, [{'title': note.title, 'content': note.content}])
    else: 
        return responseType(404, []); 

### Route pour récupérer toutes les notes
@app.get("/getNotes")
@cross_origin()
def getNotes():
    notes = session.query(Note).all()
    response = []
    for note in notes:
        response.append({'id': note.id, 'title': note.title, 'content': note.content})    
    return responseType(200, response)

### Route pour créer une note
@app.post("/post")
def createNote():
    title_note = request.json['title']
    content_note = request.json['content']

    new_note = Note(title=title_note, content=content_note)
    print(new_note)
    session.add(new_note)
    session.commit()
    return responseType(201, []);
    
### Route pour modifier une note
@app.put("/put/<int:id>")
def putNote(id):
    note = session.query(Note).get(id)
    if note is not None: 
        title_note = request.json['title']
        content_note = request.json['content']

        note.title = title_note
        note.content = content_note

        session.commit()
        return responseType(200, []);
    else: 
        return responseType(404, []); 

### Route pour supprimer une note
@app.delete("/delete/<int:id>")

def deleteNote(id):
    note = session.query(Note).get(id)
    if note is not None: 
        session.delete(note)
        session.commit()
        return responseType(204, []);
    else: 
        return responseType(404, []);
        
### Fontion pour les codes status des réponses
def responseType(statusCode=200, content=[]):
    return {"response": content}, statusCode