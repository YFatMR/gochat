import React from 'react'

interface IContextMenuProps {
    handleCloseMenu: () => void;
    menuStyle: React.CSSProperties;
}

export default function ContextMenu({ handleCloseMenu, menuStyle }: IContextMenuProps) {
    return (
        <div style={menuStyle} onClick={handleCloseMenu} className="context-menu">
            <div style={{ backgroundColor: 'white', border: '1px solid black', borderRadius: '5px', padding: '15px' }}>Select</div>
        </div>
    )
}
