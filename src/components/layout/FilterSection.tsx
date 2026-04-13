interface FilterSectionProps {
    title: string;
    items: { id: number; name: string }[];
    selected: Set<number>;
    onChange: (id: number, checked: boolean) => void;
}

export function FilterSection({ title, items, selected, onChange }: FilterSectionProps) {
    return (
        <div className="mb-4">
            <h6 className="fw-semibold mb-2">{title}</h6>
            {items.map((item) => (
                <div className="form-check mb-1" key={item.id}>
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`filter-${title}-${item.id}`}
                        checked={selected.has(item.id)}
                        // Toggle the presence of the item ID in the selected set based on the checkbox state
                        onChange={(e) => onChange(item.id, e.target.checked)}
                    />
                    <label
                        className="form-check-label"
                        htmlFor={`filter-${title}-${item.id}`}
                        style={{ fontSize: 14 }}
                    >
                        {item.name}
                    </label>
                </div>
            ))}
        </div>
    );
}