# Semester Project for Theory &amp; Practice of Software Engineering CS520
Group 16 - Macy Graves, Lindsay Devine, Fengming Shen, Siyuan Cen

## Project Idea - Campus Quest
Originally inspired by Pokemon GO, we want to build a web app that incentivizes students to go to campus and community events to meet other students, building community relationships. Instead of Pokemon, we will adopt a medieval quest-seeking theme. Campus events will be considered "quests" for Students to select and attend. The map and directions will feel like a hunt for treasure.

On the home page, Students can see a list of current and upcoming events. Students can choose to “Go” to an event. There will be a map and written route directions will pop up based on the student’s location. When they get to the event, a treasure chest will appear that they can claim.

If there are no events or if the student does not want to attend one, students can still wander around the campus area. Every hour at five random locations on campus, a holy grail will appear. If a student’s location is within 100ft, they will see the treasure and can claim it. All treasures will be added to their inventory as seen on their profile page. The treasure will count toward the user’s ranking as shown on a leaderboard on their profile page.

** See our figma mock up in the [docs]("https://github.com/megraves/cs520/blob/main/docs") directory

## Development - React-Vite-Supabase
To develop our project we will create a React-vite app using typescript. We will have a Supabase database that will handle storage and auth. We will share our files in a git repository. We will use various free libraries to help with UI. Currently, these include tailwind, heroui, font awesome, etc. Our file structure is as follows:

```sh
# Project File Structure:
src
|
+--                   # application layer containing:
|   |
|   +-- App.css       # application themes
|   +-- App.tsx       # main application component
|   +-- main.tsx      # root of the application
|   +-- index.css
|
+-- assets            # assets folder can contain all the static files such as images, logos, etc.
|
+-- components        # shared components used across the entire application, organization inspired by the Atomic Design
|   |
|   +-- atoms         # smallest and most basic sub-components (i.e. background, headers)
|   +-- buttons       # different types of reusable button components
|   +-- cards         # reusable and specific responsive cards to hold and display information
|   +-- pages         # UI containing all components rendered on depending on chosen route
|
+-- lib               # reusable libraries preconfigured for the application (specifically our Supabase client)
```
[Source: Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)
