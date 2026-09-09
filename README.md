# Prometheus Mortgage - Underwriting Matrix

[My Notes](notes.md)

## Purpose

The purpose of this application is to improve an existing webpage within the company portal I work with. The portal is currently used to manage mortgage leads and active mortgage loans. When a loan officer selects a lead, they can access that lead’s profile, which contains information collected through a third-party advertising company.

The existing lead profile also includes a pricing calculator that was intended to help loan officers estimate potential loan terms, such as interest rates, loan length, and monthly payments. However, the calculator is currently broken and is not practical to maintain because mortgage pricing depends on too many variables for a simple calculator to accurately account for.

My goal is to redesign this portion of the webpage and replace the pricing calculator with an underwriting guideline matrix. One of the biggest challenges loan officers currently face is determining which lenders a borrower may qualify with before attempting to price the loan. The guideline matrix will use information about the borrower and loan to rule out lenders whose requirements are not met. It will also consolidate important lender guidelines into one location, allowing loan officers to quickly compare available options and determine where a borrower is most likely to qualify.

Ultimately, this improvement is intended to make the qualification and pricing process faster, simpler, and more organized for loan officers.


> AI was used to revise and summarize the Purpose section. 


### Elevator pitch

This project will improve our existing mortgage lead portal by replacing an ineffective pricing calculator with an underwriting guideline matrix that helps loan officers quickly determine which lenders a borrower may qualify with. Instead of searching through lender guidelines or relying on trial and error, loan officers will have the most important qualification criteria consolidated in one place.

The return on investment comes primarily from saving time, reducing qualification errors, and helping loan officers move leads through the mortgage process more efficiently. It also serves as a learning tool, allowing newer loan officers to become familiar with lender guidelines and understand why a borrower does or does not qualify for certain loan products. Ultimately, the application will make the mortgage process faster while helping loan officers become more knowledgeable and self-sufficient. If this helps one loan officer close one more loan a year, then would have already been worth it.

> AI was used to revise and summarize the Elevator pitch section. 


### Design


**Images wrapped in URL so that they don't take up the entire screen**

[![Figma Image](image_url)](images/Screenshot%202026-09-08%20at%208.57.32 AM.png)


[![Handdrawn Outline](image_url)](images/IMG_6722.HEIC)

The Figma file embedded above was created based on our existing webpage, so some of the functionality shown in the design is already part of the current system. My goal is to expand the existing webpage by adding the third section shown at the bottom of the design. This new section will use the borrower’s information and eligibility criteria to filter out lenders they do not qualify for. The Figma file provides the most accurate representation of what I plan to implement.

The hand-drawn outline embedded above is a simpler representation of the same concept. It served as an initial rough draft that helped me organize my ideas and establish the basic structure before developing the more detailed Figma design.

> AI was used to revise and summarize the Design section. 



### Key features

- It will display Borrower and Property Information. It has an overview of all the information that is needed to successfully contact a borrower. We'll cut down on the information displayed to just what's absolutely necessary to price out a lead.
- The Pricing Calculator will feature quick calculations that are normally done for loan officers such as LTV, Funds required, estimated mortgage payment, cash flow, etc. This heavily speeds up the mental load and time to respond to a borrower. 
- The Lender Matrix will be the greatest feature. It compares the borrower and property against underwriting requirements from multiple lenders. It identifies and eliminates lenders when the loan does not meet their minimum underwriting requirements and more importantly it shows why a lender was eliminated, such as minimum credit score, minimum loan amount, property value, number of units, recent mortgage late payments, or listing history.
- It also will flag situations and give the loan officer warnings throughout the three sections. Essentially a section for stuff to look out for.



### Technologies

I am going to use the required technologies in the following ways.

- **HTML** - HTML will provide the backbone structure of the application. It will contain the three different sections as well as hold the information and loan details. 
- **CSS** - CSS will add flavor and style to the HTML backbone. I am going to utilize the already existing CSS color scheme and palette used at our company. I will also use the font, spacing, indicators, etc. Something I personally want to add is animations. When a lender is no longer applicable, I want it to light up red and phase away. So it reorganizes itself alongside changing colors. 
- **React** - React will be the frontend framework used to engage with the user (loan officer). It will be used for components, displaying information/warnings. and update the webpage as changes are made.
- **Service** - I will use AWS to host and Node.js as a backend service layer that will provide server functionality. It will handle retrieving and sending data through API's. 
- **DB/Login** - Idk if we get to pick which Database service for our projects, but if I could I would select Supabase. The database will authenticate borrowers and store loan/borrower information. 
- **WebSocket** - Websockets will allow us to update the webpage real time so that when a new lead comes through the loan officer receives it. Thus, prevening multiple users from handling the same lead. It will also provide constant information for the user in case any changes are needed. 


## 🚀 Specification Deliverable

> [!NOTE]
> Fill in this sections as the submission artifact for this deliverable. You can refer to this [example](https://github.com/webprogramming260/startup-example/blob/main/README.md) for inspiration.

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Git commit requirement)
- [ ] Proper use of Markdown
- [ ] A concise and compelling elevator pitch
- [ ] Description of key features
- [ ] Description of how you will use each technology including your 3rd party API and use of WebSocket
- [ ] One or more rough sketches of your application. Images must be embedded in this file using Markdown image references.

## 🚀 AWS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] **Rented EC2 server** - I did not complete this part of the deliverable.
- [ ] **Leased domain name** - I did not complete this part of the deliverable.
- [ ] **Server accessible** from my domain: [https://yourdomainnamehere.click](https://yourdomainnamehere.click) - I did not complete this part of the deliverable.

## 🚀 HTML deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **HTML pages** - I did not complete this part of the deliverable.
- [ ] **Proper HTML element usage** - I did not complete this part of the deliverable.
- [ ] **Links** - I did not complete this part of the deliverable.
- [ ] **Text** - I did not complete this part of the deliverable.
- [ ] **3rd party API placeholder** - I did not complete this part of the deliverable.
- [ ] **Images** - I did not complete this part of the deliverable.
- [ ] **Login placeholder** - I did not complete this part of the deliverable.
- [ ] **DB data placeholder** - I did not complete this part of the deliverable.
- [ ] **WebSocket placeholder** - I did not complete this part of the deliverable.

## 🚀 CSS deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Visually appealing colors and layout. No overflowing elements.** - I did not complete this part of the deliverable.
- [ ] **Use of a CSS framework** - I did not complete this part of the deliverable.
- [ ] **All visual elements styled using CSS** - I did not complete this part of the deliverable.
- [ ] **Responsive to window resizing using flexbox and/or grid display** - I did not complete this part of the deliverable.
- [ ] **Use of a imported font** - I did not complete this part of the deliverable.
- [ ] **Use of different types of selectors including element, class, ID, and pseudo selectors** - I did not complete this part of the deliverable.

## 🚀 React part 1: Routing deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Bundled using Vite** - I did not complete this part of the deliverable.
- [ ] **Components** - I did not complete this part of the deliverable.
- [ ] **Router** - I did not complete this part of the deliverable.

## 🚀 React part 2: Reactivity deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **All functionality implemented or mocked out** - I did not complete this part of the deliverable.
- [ ] **Hooks** - I did not complete this part of the deliverable.

## 🚀 Service deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Node.js/Express HTTP service** - I did not complete this part of the deliverable.
- [ ] **Static middleware for frontend** - I did not complete this part of the deliverable.
- [ ] **Calls to third party endpoints** - I did not complete this part of the deliverable.
- [ ] **Backend service endpoints** - I did not complete this part of the deliverable.
- [ ] **Frontend calls service endpoints** - I did not complete this part of the deliverable.
- [ ] **Supports registration, login, logout, and restricted endpoint** - I did not complete this part of the deliverable.
- [ ] **Uses BCrypt to hash passwords** - I did not complete this part of the deliverable.

## 🚀 DB deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Stores data in MongoDB** - I did not complete this part of the deliverable.
- [ ] **Stores credentials in MongoDB** - I did not complete this part of the deliverable.

## 🚀 WebSocket deliverable

For this deliverable I did the following. I checked the box `[x]` and added a description for things I completed.

- [ ] I completed the prerequisites for this deliverable (Simon deployed, GitHub link, Git commits)
- [ ] **Backend listens for WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Frontend makes WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **Data sent over WebSocket connection** - I did not complete this part of the deliverable.
- [ ] **WebSocket data displayed** - I did not complete this part of the deliverable.
- [ ] **Application is fully functional** - I did not complete this part of the deliverable.
