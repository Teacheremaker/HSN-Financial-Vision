
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type MultiSelectOption = {
  value: string
  label: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  className?: string
  placeholder?: string
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, selected, onChange, className, placeholder = "Select options...", open, onOpenChange }, ref) => {
    
    const selectedOptions = options.filter(option => selected.includes(option.value));

    const handleUnselect = (value: string) => {
        onChange(selected.filter(s => s !== value));
    }

    return (
      <Popover modal={true} open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between h-auto min-h-8", className)}
            onClick={() => onOpenChange?.(!open)}
          >
              <div className="flex gap-1 flex-wrap">
              {selectedOptions.length > 0 ? (
                  selectedOptions.map((option) => (
                      <Badge
                          variant="secondary"
                          key={option.value}
                          className="mr-1"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleUnselect(option.value);
                          }}
                      >
                          {option.label}
                          <X className="ml-1 h-3 w-3" />
                      </Badge>
                  ))
              ) : (
                  <span className="text-muted-foreground text-sm font-normal">{placeholder}</span>
              )}
              </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucune option trouvée.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      if (selected.includes(currentValue)) {
                        onChange(selected.filter((item) => item !== currentValue));
                      } else {
                        onChange([...selected, currentValue]);
                      }
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected.includes(option.value)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)
MultiSelect.displayName = "MultiSelect"

export { MultiSelect }
