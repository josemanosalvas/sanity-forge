"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export interface ModeToggleLabels {
  /** Accessible name of the trigger. */
  toggle: string;
  light: string;
  dark: string;
  system: string;
}

const defaultLabels: ModeToggleLabels = {
  dark: "Dark",
  light: "Light",
  system: "System",
  toggle: "Toggle theme",
};

/** The site passes translated labels; the English defaults serve Storybook. */
export const ModeToggle = ({
  labels = defaultLabels,
}: {
  labels?: ModeToggleLabels;
}) => {
  const { setTheme } = useTheme();
  const themes = [
    { label: labels.light, value: "light" },
    { label: labels.dark, value: "dark" },
    { label: labels.system, value: "system" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="text-foreground shrink-0"
            size="icon"
            variant="ghost"
          />
        }
      >
        <Sun className="size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">{labels.toggle}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map(({ label, value }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
