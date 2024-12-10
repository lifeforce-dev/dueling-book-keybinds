# dueling-book-keybinds
Heavily inspired by this post: https://forum.duelingbook.com/viewtopic.php?f=13&t=31743
Christen57 should get credit for the idea

# Instructions
- Paste the code into a bookmarklet maker like the one here: https://chriszarate.github.io/bookmarkleter/, and then copy the bookmarklet code it produces
- Create a bookmark, name it whatever you'd like, and paste the bookmarklet code into the URL of the bookmark

# Usage
When you first open DB, click the bookmark (only once). The code will be active until you refresh the page (so including across dueling sessions).

# Tips
- The code requires that the menu for a hovered card be invoked before it can work. It DOES NOT have to wait for the animation to finish.
  But it DOES need the menu to be created in the DOM. So before pressing a key consider hesitating just a bit for the DOM to update with the menu.
- If you press the bookmark more than once, just refresh the page and press it again so you don't get multiple keybind UIs and listeners created on top of eachother.



