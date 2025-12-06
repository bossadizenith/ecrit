import { Button } from "@/components/ui/button";
import Container from "@/components/container";
import Link from "next/link";

export default function Home() {
  return (
    <Container>
      <div>
        <h1 className="text-2xl font-bold font-mono w-full">écrit.</h1>
        <p className="text-lg text-muted-foreground">
          writing without friction
        </p>
      </div>

      <div className="flex md:items-end items-start justify-between w-full flex-col md:flex-row gap-4 ">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold font-mono">écrit</h2>
          <p className="text-lg text-muted-foreground flex flex-col">
            <span>the fastest way to start writing.</span>
            <span>the cleanest place to keep writing.</span>
          </p>
        </div>

        <Button asChild>
          <Link href="/n">Start Writing</Link>
        </Button>
      </div>
    </Container>
  );
}

{
  /*

# **Écrit — writing without friction**

### a blank canvas for your mind.

most apps make writing feel like configuration.
buttons, sidebars, toolbars, templates — it never ends.

**écrit gives you nothing.**
just a cursor, your thoughts, and room to breathe.

when you want power, it’s a shortcut away.
when you want peace, the ui disappears.

---

# **designed for momentum**

### write first. think later.

the canvas opens instantly into **zen mode** — no chrome, no ui, no noise.
it’s just you and the words.

### every tool is a shortcut

no panels, no buttons, no visual clutter.
your toolbox is behind simple commands:

* `esc` `esc` → voice commands
* `ctrl + p` → your notes
* `ctrl + shift + p` → settings
* `ctrl + i` → ai write mode

### a workspace that adapts

switch between **zen**, **compact**, and **full** modes depending on the depth of your focus.

---

# **because writing is emotional**

you think clearer when the room is clean.
you write better when nothing interrupts you.
you feel lighter when the interface gets out of the way.

**écrit protects that feeling.**

---

# **ai, but subtle**

ai write mode stays out of sight until you call it.
expand ideas, outline sections, generate flow —
all without breaking the rhythm of your typing.

your voice first. ai second.

---

# **notes, but invisible**

your library sits in a command palette.
quick search, open, edit.
no sidebar. no folder hierarchy.
nothing distracts you from the page.

---

# **a writing tool you don't have to learn**

no onboarding.
no “how to use notion” courses.
no 20-minute walkthroughs.

open the page.
start typing.
that’s it.

---

# **écrit**

the fastest way to start writing.
the cleanest place to keep writing.

   */
}
