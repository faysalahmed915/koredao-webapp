"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileNav } from "@/components/layout/nav/mobile-nav";

/**
 * Hamburger + off-canvas drawer.
 *
 * The drawer body (`MobileNav`) is only mounted once opened, so the session and
 * membership hooks inside it never run on first paint for phone users who never
 * open the menu.
 */
export function MobileNavButton() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "h-9 w-9 cursor-pointer rounded-md border border-border/40"
          )}
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] p-0 sm:w-[360px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Site navigation</SheetTitle>
            <SheetDescription>
              Browse assistance, find work and explore KoreDao resources.
            </SheetDescription>
          </SheetHeader>
          {isOpen && <MobileNav onNavigate={() => setIsOpen(false)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
