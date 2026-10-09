# CS 260 Notes

MODIFY This file represents what I have learned about web programming.

I love web programming

- [My startup](https://startup.cs260.click)
- [My simon](https://simon.cs260.click)

## Helpful links

- [Course instruction](https://github.com/webprogramming260)
- [Canvas](https://byu.instructure.com)
- [MDN](https://developer.mozilla.org)

## AWS

URL: https://sugarsantillan.com    ----> now secured :)
Server Address: http://44.205.198.203/
ssh -i ./cs260-key.pem ubuntu@44.205.198.203

I created an AWS EC2 instance using the CS 260 class AMI and connected to it using SSH. I also configured the security group to allow SSH, HTTP, and HTTPS traffic.
I then bought my name sugarsantillan.com through AWS Route 53. I created root and wildcard DNS A records pointing to my server’s public IP address.
I configured Caddy. I enabled automatic HTTPS certificate management and HTTP-to-HTTPS redirects. And finally I configured Caddy to forward startup requests to port 4000 and Simon requests to port 3000. Got everything to work. 

## HTML

I learned how HTML uses built-in elements and attributes to structure webpages. It is not used for color or scheme. CSS handles that part. HTML is just building the elements and structure of a webpage. I also learned how deployment scripts use SSH and SCP to connect to an AWS server, remove the previous website files, and upload the updated files using my .pem key.

## CSS

I learned how CSS controls the visual appearance of the HTML structure. I created a shared `main.css` file so that my different HTML pages can use the same styling instead of repeating CSS on every page.

I also learned how to use Tailwind CSS alongside my own CSS. Tailwind provides utility classes that make it easier to create layouts using Flexbox and Grid, while my `main.css` file handles most of the custom styling for the application.

I learned how responsive design allows the layout to change based on screen size. For example, my pricing page displays Loan Details, Pricing, and Eligible Lenders side-by-side on large screens, rearranges them on medium screens, and stacks them vertically on small screens.

Some CSS concepts I want to remember:

- `display: flex` is useful for arranging and aligning elements.
- `display: grid` is useful for creating responsive columns.
- `@media` can change styling based on screen size.
- `:hover`, `:focus`, `:checked`, and `:disabled` style different element states.
- `overflow-x: auto` prevents wide tables from overflowing the page on small screens.
- `#name` selects an ID, `.name` selects a class, and `body` is an element selector.


## React

React builds interactive user interfaces from reusable components. JSX lets a component describe the HTML-like structure it renders. Components can receive **props** from their parent and use **state** for data that changes over time; updating state causes React to render the updated interface.

React Router connects URL paths to page components. In this application, `/` displays Login, `/leads` displays Leads, and `/pricing` displays Pricing. Router links navigate between these views without loading a separate HTML page.

### Running the application locally

After cloning the repository and opening its folder in a terminal, install the dependencies and start the development server:

```sh
npm install
npm run dev
```

Vite serves the app locally and updates it during development. `npm run build` creates the production site in `dist/`, and `npm run preview` serves that build locally for checking.

`node_modules/` contains installed dependencies and can be recreated with `npm install`; it should not be committed. `.gitignore` keeps it and other generated or local-only files out of Git. The generated `dist/` folder is also ignored and can be recreated by running the build.


### React Components and Props

I learned how to break down a webpage into smaller reusable components instead of putting everything into one large file. For my startup, I created separate components for the Login, Leads, and Pricing pages. I also created shared components such as Navbar, Footer, PageLayout, FormInput, and AddLeadForm.

One thing I found useful was passing props into components. For example, I created a FormInput component that accepts different labels, input types, and placeholders. This allows me to reuse the same component for multiple fields instead of writing the same HTML structure repeatedly.

### React Hooks and State

I learned how to use the `useState` hook to store information that changes while the application is running.

For example, I used `useState` to control whether the Add Lead popup is visible:

```jsx
const [showAddLead, setShowAddLead] = useState(false);
```

When the user clicks the Add Lead button, the state changes to `true`, causing React to display the popup. When they close it, the state changes back to `false`.

I also used state to store leads temporarily. When a user fills out the form and clicks Save Lead, the new lead is added to an array.

```jsx
setLeads((previousLeads) => [...previousLeads, newLead]);
```

The `...` spread operator copies the existing array and adds the new lead. React then automatically updates the table without needing to refresh the page.

One limitation is that the leads are not permanently stored. Refreshing the page or navigating away from the Leads page resets the data because there is no database or local storage yet.

### Rendering Arrays with map()

I learned how React can display information dynamically using JavaScript arrays and the `map()` function.

Instead of manually creating a table row for every borrower, I can loop through the leads array and generate the rows automatically.

```jsx
{leads.map((lead) => (
  <tr key={lead.id}>
    <td>{lead.fullName}</td>
    <td>{lead.address}</td>
    <td>{lead.creditScore}</td>
  </tr>
))}
```

The `key` attribute helps React identify each row when information changes.

### React Forms

I learned how to use HTML forms inside React components. I created an Add Lead popup that collects borrower information such as their name, property address, credit score, loan type, and loan amount.

I used `FormData` to retrieve the values entered into the form and `event.preventDefault()` to prevent the browser from refreshing when the form is submitted.

The information is then passed from the AddLeadForm component to the Leads component using a function provided through props.

### React Router and Single-Page Applications

One thing I learned is that React applications don't need separate HTML files for every page. Previously, my startup used individual HTML files for Login, Leads, and Pricing.

Now React Router handles navigation between these pages using components.

I also learned that the `Link` component is used instead of traditional HTML links for internal navigation.

```jsx
<Link to="/pricing">View Pricing</Link>
```

This allows the application to navigate between pages without reloading the entire website.

### React Development and Debugging

One challenge I encountered while migrating my startup to React was maintaining the original CSS formatting. Some of the styling didn't work correctly after converting the HTML into JSX, particularly the Leads table.

I learned that reusable components can simplify the structure of an application, but it's important to make sure the existing CSS selectors still match the new components.

I also learned how to use `npm run build` to check whether the React application can be compiled for production.

I used AI tools to help create components, troubleshoot errors, and improve the CSS. I reviewed the changes and tested the application as I worked through the deliverable.