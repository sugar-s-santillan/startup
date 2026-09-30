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

Interesting things I have learned about React
