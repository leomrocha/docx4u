# docx4u
Main repository for docx templating 

## Setup:
```
yarn install
yarn run electron:dev # start as application
# OR
yarn start # start as website
```

## Problem: 
When one has to fill out the same documents over and over again but with different texts over and over again
examples:
- bills,
- checks, legal forms
- other forms

In general, one has a folder with the .docx with parts filled with dots and you go and open each document, save it as a copy and fill it.

## Background and concurrents:

Different Office suits (Open office, Google Docs, Microsoft Office) have a similar kind of feature with a templating language and using some kind of extra features one can link a text document with a spreadsheet or a form in particular which allows for filling fields. The issue is that these features are not easy to use, is not known by many people and needs more expertise than simple writing text. 
The idea of the current App is to make this really easy to use 

## Idea:
 Make a program a bit easier (however there is a web, mobile app, desktop, it doesn't matter) what do you say, look here I have my templates in this folder (and all sub-folders)
Instead of putting dots on the templates, you give things names, style '{% Name%}', '{% surname%}', '{% date%}', etc.
So when you want to fill one or several simultaneously, you can create groups of documents that always go together (a folder for example):
* You select them, you press the "Fill" button
The program generates a form (web style) with Name, surname, date (which can even automatically fill in some fields), etc.
In case of having selected several documents, the program generates a form and facilitates the filling of the fields that are repeated between documents
Select what you want (create, save to disk, save in google docs, send by email)
You press "Create" and voilà, there you have the documents.

The difficult part for the user is to migrate the dotted documents to the necessary format. (I could do something to make that part easier too) (see first extra feature bolow)


## Privacy:
 The documents do not go anywhere, they are processed on the PC (or tablet, or phone) where you are doing that and are stored on the same side (unless otherwise instructed.

## Monetization:
- [ ] SaaS (Software as a Service), with periodic payment (monthly / annual).
- [ ] Personalization and Integration with other services (per contract)

## First extra feature:
-  [ ] Helper function to find places that need filling in a document that needs to be created as a template and propose to the user to name it. The application should write the template file.

## Another extra features:
- [ ] Keep track of the values filled and which documents it was used, to be able to give hints in future documents
- [ ] Allow for sequential filling of a document (invoicing number for example)
- [ ] Allow for setting a type in a field to fill in the template which could help for example for dates, numbers or others to validate and to make a helper selector (calendar for example)

