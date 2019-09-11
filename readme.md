# Skills matrix

![Skills matrix logo](https://github.com/L3bowski/skills-matrix-client-jquery/blob/master/public/images/skills.png)

Open source web application built in .NET Core for companies to keep tracking of their employees skills/abilities.

The main page contains a list with the most skilled employees (employees that master more skills) and another one with the rearest skills (skills that are less common between employees). There are also two symmetrical maintenance sections for both employees and skills in order to view, create, edit or delete entities.

Each of the two entities sections consist of a set with the following views:

- Items list. This view is intended to be the entry point to any entity of the given type (i.e. Employees or Skills), inlcuding a link to create new ones. As the number of entities may grow large enough to cause a performance issue, the list is paginated (returning a customizable maximum number of results) and includes a searcher to target specific entities
- Details view. Provides information of an entity based on its Id, along with the action controls to edit or delete that entity
- Edit view. Allows to modify an existing entity based on its Id, or to create a new on if no Id is provided

For both sections there are a Views controller, that provides Html pages without entity data (excluding Ids), and an Api controller that provides all the methods for the views to gather the necessary data and perform the required operations. The main advantage of this architecture is that there is no server templating code (e.g. Razor), so that each view is self sufficent (e.g. any event can be handled by the view itself without need to refresh the page) and there is no code duplication (e.g. templating code and JavaScript).
