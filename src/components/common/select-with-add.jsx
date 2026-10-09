import React from "react";
import ReactSelect, { components } from "react-select";
import { Plus } from "lucide-react";

/**
 * Reusable searchable select + footer "Add new" button.
 *
 * ── Placement args (aapke kaam ke) ─────────────────────────────────
 * @param {"bottom-left"|"bottom-right"|"top-left"|"top-right"|"bottom"|"top"} [placement="bottom-left"]
 *   Shorthand: dropdown kidhar khulega.
 *   - "bottom-*" = neeche, "top-*" = upar
 *   - "*-left" = control ke left edge se chipka, "*-right" = right edge se chipka
 *   Example: placement="top-right"
 *
 * @param {"auto"|"bottom"|"top"} [menuPlacement="auto"]
 *   react-select native: upar/neeche. `placement` diya ho to wahi jeetega.
 * @param {"left"|"right"} [align="left"]
 *   Dropdown left se chipkega ya right se. `placement` diya ho to wahi jeetega.
 * @param {"absolute"|"fixed"} [menuPosition="absolute"]
 *   - "absolute" = box KE ANDAR (parent ke saath scroll hoga, Card ke andar sahi)
 *   - "fixed"    = box KE BAHAR (overflow-hidden / Dialog / Card ke upar chahiye to,
 *                  viewport se fixed rahega, kat-ta nahi)
 * @param {HTMLElement|null} [menuPortalTarget=null]
 *   Dropdown ko kisi box ke bahar render karna ho to target do,
 *   e.g. menuPortalTarget={document.body} + menuPosition="fixed".
 *   Dialog/Card me overflow-hidden issue ho to ye combo use karo.
 * @param {boolean} [menuShouldBlockScroll=false]
 * @param {number} [maxMenuHeight=200]
 * @param {number} [zIndex=50]
 *
 * ── Add-button args ────────────────────────────────────────────────
 * @param {boolean} [showAddButton=true]
 * @param {string} [addLabel="Add New"]
 * @param {(typed:string)=>string} [renderAddLabel]  e.g. (t) => t ? `Add "${t}"` : "Add New"
 * @param {(typed:string)=>void} [onAdd]
 * ── Option subtitle ────────────────────────────────────────────────
 * @param {(option)=>string} [getSubtitle]  e.g. (o) => o?.buyer?.buyer_mobile || ""
 *   Diya to har row me label ke neeche chhota subtitle dikhega (buyer mobile/email jaise).
 */

export const resolvePlacement = (placement, menuPlacement = "auto", align = "left") => {
  let mp = menuPlacement;
  let al = align;
  if (placement) {
    const p = placement.toLowerCase();
    if (p.startsWith("top")) mp = "top";
    else if (p.startsWith("bottom")) mp = "bottom";
    else if (p === "top") mp = "top";
    else if (p === "bottom") mp = "bottom";
    // left/right akela aaye to usko align samjho
    if (p.endsWith("right") || p === "right") al = "right";
    else if (p.endsWith("left") || p === "left") al = "left";
  }
  return { menuPlacement: mp, align: al };
};

const buildStyles = (hasError, align, maxMenuHeight, zIndex) => ({
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    borderColor: state.isFocused
      ? "var(--primary-color)"
      : hasError
        ? "rgb(239, 68, 68)"
        : "var(--line)",
    backgroundColor: "var(--base)",
    "&:hover": {
      borderColor: hasError ? "rgb(239, 68, 68)" : "var(--primary-color)",
    },
    boxShadow: state.isFocused
      ? hasError
        ? "0 0 0 1px rgb(239, 68, 68)"
        : "0 0 0 1px var(--primary-color)"
      : "none",
    borderRadius: "calc(var(--radius) - 2px)",
    cursor: "pointer",
    transition: "all 0.2s",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--surface)",
    border: "1px solid var(--line)",
    borderRadius: "calc(var(--radius) - 2px)",
    boxShadow: "var(--shadow-md)",
    zIndex,
    marginTop: "4px",
    marginBottom: "4px",
    // Narrow control ho to bhi menu usable rahe — kam se kam 240px.
    minWidth: 240,
    // left/right alignment
    left: align === "right" ? "auto" : 0,
    right: align === "right" ? 0 : "auto",
  }),
  menuPortal: (base) => ({ ...base, zIndex: zIndex + 10 }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: maxMenuHeight,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--primary-soft)"
      : state.isFocused
        ? "var(--primary-soft)"
        : "transparent",
    color: state.isSelected ? "var(--primary-color)" : "var(--ink)",
    borderRadius: "calc(var(--radius) - 4px)",
    padding: "8px 12px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.15s",
    "&:active": { backgroundColor: "var(--primary-soft)" },
  }),
  placeholder: (base) => ({ ...base, color: "var(--ink-soft)", fontSize: "14px" }),
  input: (base) => ({ ...base, color: "var(--ink)", fontSize: "14px" }),
  singleValue: (base) => ({ ...base, color: "var(--ink)", fontSize: "14px" }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--ink-soft)",
    padding: "8px",
    "&:hover": { color: "var(--ink)" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--ink-soft)",
    padding: "8px",
    "&:hover": { color: "var(--danger)" },
  }),
});

// Option row with optional subtitle (label + chhoti second line).
// getSubtitle diya ho to subtitle dikhega, warna normal option.
const SubtitleOption = (props) => {
  const subtitle = props.selectProps?.getSubtitle?.(props.data) || "";
  if (!subtitle) return <components.Option {...props} />;
  return (
    <components.Option {...props}>
      <div className="flex flex-col">
        <span className="font-medium text-sm leading-tight">{props.data.label}</span>
        <span className="text-xs text-slate-500 leading-tight">{subtitle}</span>
      </div>
    </components.Option>
  );
};

// Footer "second line" — hamesha dikhega. onMouseDown + preventDefault taaki select blur na ho.
const AddMenu = (props) => {
  const { showAddButton, addLabel, renderAddLabel, onAdd } = props.selectProps || {};
  const typed = props.selectProps?.inputValue || "";
  if (!showAddButton) return <components.Menu {...props} />;
  const label =
    typeof renderAddLabel === "function"
      ? renderAddLabel(typed)
      : typed?.trim()
        ? `${addLabel} "${typed.trim()}"`
        : addLabel;
  return (
    <components.Menu {...props}>
      {props.children}
      <div className="sticky bottom-0 p-1.5 border-t bg-[var(--surface)] dark:border-slate-800">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAdd?.(typed);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold overflow-hidden text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950/60 transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} className="shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      </div>
    </components.Menu>
  );
};

const SelectWithAdd = React.memo(
  ({
    value,
    onChange,
    options = [],
    placeholder = "Select...",
    isLoading = false,
    isDisabled = false,
    isClearable = true,
    isSearchable = true,
    hasError = false,
    filterOption,
    noOptionsMessage,
    // placement args
    placement,
    menuPlacement = "auto",
    align = "left",
    menuPosition = "absolute",
    menuPortalTarget = null,
    menuShouldBlockScroll = false,
    maxMenuHeight = 200,
    zIndex = 50,
    // add-button args
    showAddButton = true,
    addLabel = "Add New",
    renderAddLabel,
    onAdd,
    // option subtitle
    getSubtitle,
    // passthrough for controlled menu + input + custom components
    menuIsOpen,
    onMenuOpen,
    onMenuClose,
    onInputChange,
    components: componentsOverride = {},
    styles: stylesOverride = {},
    ...rest
  }) => {
    const resolved = resolvePlacement(placement, menuPlacement, align);

    const selectOptions = options.map((o) =>
      o?.label !== undefined && o?.value !== undefined
        ? o
        : { value: o?.value ?? o, label: o?.label ?? o }
    );

    const selectedOption =
      value && value !== "" && value !== null
        ? (() => {
            const v = value?.value !== undefined ? value.value : value;
            return selectOptions.find((opt) => opt.value === v) || null;
          })()
        : null;

    return (
      <ReactSelect
        value={selectedOption}
        onChange={(sel) => {
          if (sel) onChange?.({ value: sel.value, label: sel.label, ...sel });
          else onChange?.(null);
        }}
        options={selectOptions}
        placeholder={placeholder}
        isLoading={isLoading}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={isSearchable}
        filterOption={filterOption}
        noOptionsMessage={
          noOptionsMessage
            ? () => noOptionsMessage
            : ({ inputValue }) =>
                inputValue
                  ? `No match for "${inputValue}" — neeche button se add karo`
                  : "No options available"
        }
        styles={{ ...buildStyles(hasError, resolved.align, maxMenuHeight, zIndex), ...stylesOverride }}
        components={{ Menu: AddMenu, ...(getSubtitle ? { Option: SubtitleOption } : {}), ...componentsOverride }}
        // placement wiring
        menuPlacement={resolved.menuPlacement}
        menuPosition={menuPosition}
        menuPortalTarget={menuPortalTarget}
        menuShouldBlockScroll={menuShouldBlockScroll}
        maxMenuHeight={maxMenuHeight}
        // add-button wiring (Menu ke andar via selectProps)
        showAddButton={showAddButton}
        addLabel={addLabel}
        renderAddLabel={renderAddLabel}
        onAdd={onAdd}
        getSubtitle={getSubtitle}
        // controlled-menu passthrough (agar parent control kare)
        {...(menuIsOpen !== undefined ? { menuIsOpen } : {})}
        {...(onMenuOpen ? { onMenuOpen } : {})}
        {...(onMenuClose ? { onMenuClose } : {})}
        {...(onInputChange ? { onInputChange } : {})}
        {...rest}
      />
    );
  }
);

SelectWithAdd.displayName = "SelectWithAdd";

export default SelectWithAdd;
