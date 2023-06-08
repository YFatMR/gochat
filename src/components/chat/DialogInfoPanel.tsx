import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {

    LinkInfo,
    LinksResponse,
    Link,
    ChatInfo,
    Instruction,
    InstructionsResponse,
    InstructionInfo,
} from "../../types/Chats"
import { PersonInfoOption } from "./PersonInfoOption"

import { ChatService } from "../../services/ChatService";
import { BigAvatar } from "./Avatar"
import { MenuOption } from "./MenuOption"
import { SettingsItem } from "./SettingsItem"
import Observer from "../common/Observer";

// Images
import closeIcon from "../../assets/close.png";


// CSS
import "../../styles/css/Chats.css";


interface Props {
    activeDialog: ChatInfo | null
    isActive: boolean
    setIsActive: any

    github: string | null
    username: string | null
    status: string
}

const linkInfoFromResponse = (link: Link): LinkInfo => {
    return {
        id: parseInt(link.linkID.ID),
        messageID: parseInt(link.messageID.ID),
        link: link.link,
        createdAt: new Date(link.createdAt),
    }
}


const linksFromResponse = (response: LinksResponse): LinkInfo[] => {
    return response.links ? response.links.map(link => {
        return linkInfoFromResponse(link)
    }) : []
}


const instructionInfoFromResponse = (instruction: Instruction): InstructionInfo => {
    return {
        id: instruction.instructionID.ID,
        text: instruction.text,
        title: instruction.title,
        createdAt: new Date(instruction.createdAt),
    }
}


const instructionsFromResponse = (response: InstructionsResponse): InstructionInfo[] => {
    return response.instructions ? response.instructions.map(instruction => {
        return instructionInfoFromResponse(instruction)
    }) : []
}


export const DialogInfoPanel: React.FC<Props> = ({ activeDialog, isActive, setIsActive, github, username, status }) => {
    const [links, setLinks] = useState<LinkInfo[]>([]);
    const [instructions, setInstructions] = useState<InstructionInfo[]>([]);
    const navigate = useNavigate();

    const [isIntsrucionsWindowActive, setIsIntsrucionsWindowActive] = useState<boolean>(false);

    const fetchLinks = async () => {
        console.log("NO active dialog")
        if (!activeDialog || !isActive) {
            return
        }
        const response = await ChatService.getLinks(activeDialog.id, 30);
        console.log("fetchLinks response", response)
        if (response.status != 200) {
            return
        }
        const newLinks = linksFromResponse(response.data)
        if (newLinks.length === 0) {
            return
        }
        setLinks(newLinks);
    }

    const fetchBottomLinks = async () => {
        if (!activeDialog || links.length === 0) {
            return
        }
        const response = await ChatService.getLinksAfter(activeDialog.id, links[links.length - 1].id, 30);
        console.log("getLinksAfter response", response)
        if (response.status != 200) {
            return
        }
        const newLinks = linksFromResponse(response.data)
        if (newLinks.length === 0) {
            return
        }
        setLinks([...links, ...newLinks]);
    }

    const fetchInstructions = async () => {
        if (!activeDialog || !isActive) {
            return
        }
        const response = await ChatService.getInstructions(activeDialog.id, 30);
        console.log("fetchInstructions response", response)
        if (response.status != 200) {
            return
        }
        const newInstructions = instructionsFromResponse(response.data)
        if (newInstructions.length === 0) {
            return
        }
        setInstructions(newInstructions);
    }

    const smallTitleFromString = (str: string) => {
        if (str.length == 0) {
            return "e"
        }
        const splited = str.split(' ')
        if (splited.length == 0) {
            return "E";
        } else if (splited.length == 1) {
            return splited[0][0];
        }
        return splited[0][0] + splited[1][0];
    }

    const getGithubNickname = (url: string) => {
        if (!url.startsWith('https://github.com')) {
            return url
        }
        const pathname = new URL(url).pathname;
        const parts = pathname.split("/");

        if (parts.length > 1) {
            return parts[1];
            console.log(username); // Output: yfatmr
        }
        return url
    }

    // useEffect(() => {
    //     fetchLinks()
    // }, [activeDialog, isActive])

    useEffect(() => {
        if (isIntsrucionsWindowActive) {
            fetchInstructions()
        } else {
            fetchLinks()
        }
    }, [activeDialog, isActive, isIntsrucionsWindowActive])

    if (!activeDialog || !isActive) {
        return (
            <div></div>
        )
    }

    return (
        <div className="right-container">
            <div style={{ display: "flex", flexDirection: "column", marginTop: '16px', gap: '12px' }}>
                {/* personal info: name & surname */}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <BigAvatar smallTitle={smallTitleFromString(activeDialog?.name || "")} fullName={activeDialog?.name || ""} />
                    <img
                        src={closeIcon}
                        style={{ width: '14px', height: '14px' }}
                        onClick={() => setIsActive(false)}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: "32px" }}>
                        {activeDialog?.name}
                    </span>
                    <span style={{ fontSize: "14px", color: "#3F3F46" }}>
                        {status}
                    </span>
                </div>
            </div>
            <div style={
                {
                    display: "flex", flexDirection: "column",
                    background: '#FAFAFA',
                    padding: '16px',
                    borderRadius: '12px',
                    gap: '12px',
                }
            }>
                {/* personal info: mail, username, github */}
                {/* {email && <PersonInfoOption title="email" text={email} url="" />} */}
                {username && <PersonInfoOption title="username" text={username} url="" />}
                {github && <PersonInfoOption title="gihub" text={getGithubNickname(github)} url={github} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflow: 'auto', paddingBottom: '16px' }}>
                {/* links, instructions options */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <MenuOption title="Links" active={!isIntsrucionsWindowActive} onClick={() => { setIsIntsrucionsWindowActive(false) }} />
                    <MenuOption title="Instructions" active={isIntsrucionsWindowActive} onClick={() => { setIsIntsrucionsWindowActive(true) }} />
                </div>
                <div className="settings-item-container">
                    {/* links/instructions list */}
                    {!isIntsrucionsWindowActive &&
                        links.map((link) => (
                            <SettingsItem
                                id={link.id}
                                title={(new URL(link.link)).hostname}
                                text={link.link}
                                onClick={() => { }}
                            />
                        ))
                    }
                    {isIntsrucionsWindowActive && instructions.map((instruction) => (
                        <SettingsItem
                            id={instruction.id}
                            title={instruction.title}
                            text={instruction.text}
                            onClick={() => {
                                navigate(`/i`, { state: { title: instruction.title, text: instruction.text } })
                            }}
                        />
                    ))}
                    <Observer height='10px' onIntercept={() => {
                        fetchBottomLinks()
                    }} />
                </div>
            </div>
        </div>
    )
}