# studytimer Project

## Business Requirements
-An MVP of time Management application as a web app
-where it shld contain different type of study methods which are used to build an app lyk An Pareto Analysis (a.k.a., the 80/20 rule),Pomodoro Technique,Eisenhower Matrix,Parkinson’s Law,all those different kind of techniques of time managemnt
-i want each methid to have different page all connected in the dashboard if the use click the particular technique it should load tht page
-no search ntg keep it simple 
-The priority is a slick, professional, gorgeous UI/UX with very simple features
-explain each techniques clearly to the user 
-for pomodoro technique there shld be three set of timer and then one is 25mins and 5mins and then long break tht is 15mins aftr 4 short break user can have long break tht is 15 mins 
-Eisenhower Matrix four separate quadrants, sorting them by important vs. unimportant and urgent vs. not urgent and where the user could edit those quadrants according to their wish their do,decide,delegate,delete
-similarly for the other tehniques where user can use the website and test it and check which one is useful for them or use it for timer and management purpose 
-add some features lyk fun little game while their break lyk snake game or some other game u can ask me info abt it if u want 

## Technical Details

- Implemented as a modern NextJS app, client rendered
- The NextJS app should be created in a subdirectory `frontend`
- No persistence
- No user management for the MVP
- Use popular libraries
- As simple as possible but with an elegant UI
-if the app needs backend use python 

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all critiera are met
3. Carry out extensive integration testing with Playwright or similar, fixing defects
4. Only complete when the MVP is finished and tested, with the server running and ready for the user

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever

## Color Scheme
-abt this part i want my website to be animated u can give me steps so tht i can give u by getting it frm nano banana as u say i can do those steps i want it to be intractive
-no emojis in the app
-i want the app to look aesthetic not a simple purple coloured app  

## V2 (after MVP is complete)

These are explicitly out of scope for the MVP and should only be picked up once all MVP phases are finished and tested:

1. Backend + auth: add Supabase, with login so each user's data (tasks, matrix, etc.) is saved and reloaded on login instead of resetting on refresh. Overrides the "No persistence" / "No user management" MVP rules above, intentionally, for v2 only.
2. Combined "all techniques at once" view: a separate page where the user can bring multiple technique widgets (Pomodoro, Eisenhower, Pareto, Parkinson's) onto one screen via a plus icon, to use them side by side instead of navigating between separate pages.
3. Analytics/report page: a separate page showing productive minutes, completed-task analysis, daily streak, and daily/weekly/monthly hours spent, with a GitHub-style contribution heatmap (small boxes per day). Depends on item 1 (Supabase + auth) being done first, since streaks and history need persisted data across sessions to mean anything.

