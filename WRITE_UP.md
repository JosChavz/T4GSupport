## Notes
Firstly, all of this comes from muscle memory, but let's go step by step, and I will try to explain what is added, what is done, and how it works to the best of my abilities. When in doubt, read the documentation.

## Description
Throughout all of this, I was working on the directory `src/app/general/landing`. As we mentioned earlier, to create component, run `ng g component <name>`. So I ran both `ng g component help-modal` and `ng g component help-tooltip`. After those components are made, they are automatically added to the module's `module.ts` file. Our module is `general`, so looking into `general.module.ts`, I make sure that all files are saved and my components are there. What to look for is the class' name because Components and Containers are classes. If you are unsure of their name, look at the new component's `.component.ts` file and you will see their name after the `export class` portion near the top of the file!

Alright, after making sure that those class names are there, then I start making the `help-tooltip` component. Why this? Because that component will be rendered on the `landing` page. The `help-modal` component is what appears INSIDE of the modal, so we don't actually want to put it on the container! The way to use a component in the containers HTML page, `landing.compontent.html`, is by using the component's selectors as tags.

---

### What is the selector and what are tags?
```ts
@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: LandingAnimations,
})
```
When a component is generated, it always has these. This is called a decorator in TypeScript, and when Angular sees this, it registers that this class will be recognized as a component with the metadata that has been written inside.
So, one of the metadata is going to be `selector`, and its value will be used for tags. So, **tags** in HTML is that what you see commonly like `<p></p>` or `<h1></h1>`. Therefore, using the selector, we convert that to tags such as `<app-landing></app-landing>` or whatever your selector has been defined.

You can read more about Component's architecture on their [documentation](https://angular.io/guide/architecture-components).

---

Alright, so we add the component onto our container HTML page, and something should appear! This is where I do the static implementation of the task. Text, styling, button, and done! After that was done, then it's time to add the modal. A modal is a window that appears and disappears. It's not part of the container's HTML template. In fact, if you were to investigate further using the Web Developer Tools, you can check in the DOM that the modal opens up in a new `div` with the class of `cdk-overlay-container`!

In order to make this modal, we need to do some wiring with the component and container. First of all, we need some sort of tool that tells the container from the component that we want the modal to appear. The way to do that is by using something called an `EventEmitter`.

---

### What are EventEmitters?
As mentioned on their lovely [docs](https://angular.io/api/core/EventEmitter), `EventEmitters` are classes that are used in components with the `@Output` directive "to emit custom events". These custom events are functions defined in the containers, but we'll get to that later. Anyways, the only thing to memorize is that the syntax will more than always be:

```ts
@Output() doSomething: EventEmitter<void> = new EventEmitter();
```

Wait! Before we go any further, there are some important things to note. `EventEmitter` is a Generic Class. This means that the data type within those `<>` will be the data that is emitted, aka returned back to the container. Read this [article](https://www.telerik.com/blogs/angular-basics-how-to-use-event-emitter-examples) to know more about it. In this example, we are not returning back any piece of information, so we use `void`.

---

OKAY, so after we make an `EventEmitter` variable, we will want to invoke that variable's function. On the documentation, it shows to use `this.doSomething.emit()`. Seriously, that's it. When this is done, this will emit an event to the container. BUT before we do all that logic, let's first make a function on the tooltip component TS file, so that we can connect it to the button we made.

*you can check the `src/app/landing/help-tooltip/help-tooltip.component.ts` for example*

```ts
eventHandler() {
	this.doSomething.emit()
}
```
```html
<button (click)="eventHandler()"></button>
```

In this piece of code from the tooltip component HTML file, we use something called "event binding" which is essentially calling a function from our component's TS file, but you can read more about it on their [documentation](https://angular.io/guide/event-binding). We want to invoke the function because when the "click" event occurs, then it invokes the `eventHandler`.

From there on, we are halfway done... phew, take a breather. Now we want to data-bind a function from the container's to the component's because whenever the `@Output` or `@Input` decorator is used, we are then required to pass some data to it. On the container's HTML page, we have something like

```html
<app-help-tooltip></app-help-tooltip>
```

because it used to be all static, but now that it requires a piece of data to be passed onto the component, then we give it that. In the container's TS file, we create a new function such as

```ts
receiver() {
	console.log("I GOT THE INFORMATION!");
}
```

and from there, we bind it with the component in the container's HTML page such as:
```html
<app-help-tooltip (doSomething)="receiver()"></app-help-tooltip>
```

Alright, that was too quick, but remember how I said event-binding calls from the TS file? Well, using `@Output` requires for the `()` to be used, and what goes inside is the variable's NAME from the component's variable that used the `@Output` decorator. To refresh your memory, we defined it as...
```ts
@Output() doSomething: EventEmitter<void> = new EventEmitter();
```
inside the component's TS file.

After that, we want it to be assigned to the function from the container's TS function that we defined which is the `receiver` function. Look how we invoke it similar to the `click` event from the component...

Finally, we have binded the two!!! So now when the button from the component is clicked, the function `eventHandler` will be invoked, to which calls the `doSomething.emit()` function. That function then propegates up to the container and invokes the function that was passed during the event binding session, `receiver()`. If we were to look at the console logs on our browser, we would see that "I GOT THE INFORMATION!" would display, which means all works...

**BUT WAIT THERE'S MORE~!**

What is left is to do the modal!! That was the whole point of this task! In order for the modal to appear, we have to use something called a `Dialog` and that itself has to be included in the container's constructor fields. Look at the *Overview* from the [Angular Material documentation](https://material.angular.io/components/dialog/overview), but they have something like

```ts
constructor(private dialogRef: MatDialogRef<YourDialog>) { }
```

However, for our case, we simply want to add that to our current constructor like such:

```ts
  constructor(
    private state: LandingState,
    private route: ActivatedRoute,
    private selectors: LandingSelectors,
    private store: Store<fromStore.State>,
    private db: FirebaseService,
    private dialog: MatDialog,
  ) {
  }
```

Now we can prompt this dialog by using one of their functions known as `open` which takes in the class of the component to render on the screen plus any extra configuration. We add this code onto our `receiver` function in the container's TS file because when the button from the component is clicked, we want the container to then open the dialog showing the modal component. So, add this piece of code to the `receiver` function from the container's TS file:

```ts
this.dialog.open(HelpModalComponent, {
  width: '80%',
  height: '80%',
});
```

We called the modal component "HelpModalComponent" thus we use that. As for the configuration, we do the `width` and `height` to display, but there is honestly so many more properties to add in. Just look at their config on their [docs](https://material.angular.io/components/dialog/api#MatDialogConfig)! Don't forget that these values can be changed from the container, and new properties can be added. Don't be restricted in what I write!

Let's assume we are happy with what we have though... Now we click on the component's button and BOOM! The dialog opens up with the modal component that we want!

That's a lot so make sure to take your time in reading this file PLUS reading the code. Try to understand the pieces and how it works, don't just copy and paste. Learn from the documentation and the links that I sent. 
