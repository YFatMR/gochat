import React, { useState } from 'react'
import "../../styles/css/Sandbox.css"
import classnames from 'classnames';

const HorizontalSplitter = ({ isDragging, ...props }: any) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div
            tabIndex={0}
            className={classnames("horizontal-drag-bar", { "horizontal-drag-bar_dragging": isFocused })}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
        />
    )
}

export default HorizontalSplitter
