import React from "react";
import ReactSelect from "react-select";

export const MemoizedSelect = React.memo(
  ({
    value,
    onChange,
    options,
    placeholder,
    isMulti = false,
    isLoading = false,
    noOptionsMessage,
    className,
    classNamePrefix,
    hasError = false,
    hasIcon = false,
    ...props
  }) => {
    const selectOptions = options.map((option) => {
      if (option?.label && option?.value !== undefined) {
        return {
          value: option.value,
          label: option.label,
          ...option, 
        };
      }
      return {
        value: option.value || option,
        label: option.label || option,
      };
    });

    const selectedOption = isMulti
      ? Array.isArray(value)
        ? value.map((v) => {
            const valueToFind = v?.value !== undefined ? v.value : v;
            const found = selectOptions.find(
              (opt) => opt.value === valueToFind
            );
            return found || v;
          })
        : []
      : value && value !== "" && value !== null
      ? (() => {
          const valueToFind = value?.value !== undefined ? value.value : value;
          const found = selectOptions.find(
            (option) => option.value === valueToFind
          );
          return found || value;
        })()
      : null;

    const customSelectStyles = {
      control: (base, state) => ({
        ...base,
        paddingLeft: hasIcon ? "24px" : "0px",
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
        zIndex: 50,
        marginTop: "4px",
      }),
      menuList: (base) => ({
        ...base,
        padding: "4px",
        maxHeight: "200px",
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
          ? "var(--primary-soft)"
          : state.isFocused
          ? "var(--primary-soft)"
          : "transparent",
        color: state.isSelected
          ? "var(--primary-color)"
          : "var(--ink)",
        borderRadius: "calc(var(--radius) - 4px)",
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        transition: "all 0.15s",
        "&:active": {
          backgroundColor: "var(--primary-soft)",
        },
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: "var(--primary-soft)",
        borderRadius: "calc(var(--radius) - 2px)",
        display: "flex",
        gap: "2px",
      }),
      multiValueLabel: (base) => ({
        ...base,
        color: "var(--primary-color)",
        fontSize: "13px",
        padding: "2px 6px",
      }),
      multiValueRemove: (base) => ({
        ...base,
        color: "var(--ink-soft)",
        borderRadius: "0 calc(var(--radius) - 3px) calc(var(--radius) - 3px) 0",
        cursor: "pointer",
        "&:hover": {
          backgroundColor: "var(--danger)",
          color: "#fff",
        },
      }),
      placeholder: (base) => ({
        ...base,
        color: "var(--ink-soft)",
        fontSize: "14px",
      }),
      input: (base) => ({
        ...base,
        color: "var(--ink)",
        fontSize: "14px",
      }),
      singleValue: (base) => ({
        ...base,
        color: "var(--ink)",
        fontSize: "14px",
      }),
      indicatorSeparator: (base) => ({
        ...base,
        backgroundColor: "var(--line)",
      }),
      dropdownIndicator: (base) => ({
        ...base,
        color: "var(--ink-soft)",
        padding: "8px",
        "&:hover": {
          color: "var(--ink)",
        },
      }),
      clearIndicator: (base) => ({
        ...base,
        color: "var(--ink-soft)",
        padding: "8px",
        "&:hover": {
          color: "var(--danger)",
        },
      }),
      loadingIndicator: (base) => ({
        ...base,
        color: "var(--ink-soft)",
      }),
    };

    return (
      <ReactSelect
        value={selectedOption}
        onChange={(selected) => {
          if (isMulti) {
            const selectedValues = Array.isArray(selected)
              ? selected.map((s) => ({
                  value: s.value,
                  label: s.label,
                  ...s,
                }))
              : [];
            onChange(selectedValues);
          } else {
            if (selected) {
              onChange({
                value: selected.value,
                label: selected.label,
                ...selected,
              });
            } else {
              onChange(null);
            }
          }
        }}
        options={selectOptions}
        placeholder={placeholder || "Select..."}
        isMulti={isMulti}
        isLoading={isLoading}
        styles={customSelectStyles}
        components={{
          IndicatorSeparator: () => null,
        }}
        noOptionsMessage={
          noOptionsMessage
            ? () => noOptionsMessage
            : () => "No options available"
        }
        className={className}
        classNamePrefix={classNamePrefix}
        isClearable
        {...props}
      />
    );
  },
  (prevProps, nextProps) => {
    return (
      JSON.stringify(prevProps.value) === JSON.stringify(nextProps.value) &&
      JSON.stringify(prevProps.options) === JSON.stringify(nextProps.options) &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.isMulti === nextProps.isMulti &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.hasError === nextProps.hasError &&
      prevProps.noOptionsMessage === nextProps.noOptionsMessage
    );
  }
);

MemoizedSelect.displayName = "MemoizedSelect";

export default MemoizedSelect;
