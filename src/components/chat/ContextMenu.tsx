import React from 'react'


interface Item {
    title: string
    callback: () => void
}

interface IContextMenuProps {
    menuStyle: React.CSSProperties;
    items: Item[]
}

export default function ContextMenu({ menuStyle, items }: IContextMenuProps) {
    return (
        <div style={menuStyle} className="context-menu">
            {items.map(item => {
                return <div key={new Date().getTime()} onClick={item.callback} style={{ backgroundColor: 'white', border: '1px solid black', borderRadius: '5px', padding: '15px' }}>{item.title}</div>
            })}
        </div>
    )
}
