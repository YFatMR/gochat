import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import classnames from 'classnames';
import md5 from 'md5';


interface InnerProps {
    width: string
    height: string
    fontSize: string
    smallTitle: string
    color: string
    fullName: string
}

interface IProps {
    smallTitle: string
    fullName: string
}

const backgroudColors: string[] = [
    "#FFB6C1", // Розовато-персиковый
    "#FFC0CB", // Розовый
    "#FF69B4", // Ярко-розовый
    "#FFA07A", // Светло-лососевый
    "#FF8C00", // Темно-оранжевый
    "#FF7F50", // Морковный
    "#FF6347", // Темно-лососевый
    "#FF4500", // Оранжево-красный
    "#FFD700", // Золотой
    "#FFFF00", // Жёлтый
    "#ADFF2F", // Зелёный
    "#7FFF00", // Желто-зелёный
    "#00FF00", // Ярко-зелёный
    "#00FA9A", // Морская волна
    "#00CED1", // Тёмно-бирюзовый
    "#4682B4", // Стальной
    "#1E90FF", // Дымчато-синий
    "#0000FF", // Синий
    "#8A2BE2", // Фиолетовый
    "#9932CC", // Тёмно-фиолетовый
    "#FF1493", // Глубокий розовый
    "#C71585", // Средний фиолетовый
    "#D2691E", // Шоколадный
    "#8B4513", // Ржаво-коричневый
    "#808080", // Серый
    "#A9A9A9", // Тёмно-серый
    "#C0C0C0", // Серебристый
    "#FFFACD", // Лимонно-кремовый
    "#F5DEB3", // Песочный
    "#FFE4B5", // Мокрый песок
    "#FFDAB9", // Персиковый
    "#F0E68C", // Хаки
    "#BDB76B", // Тёмный хаки
    "#EEE8AA", // Жёлто-зелёный
    "#F0FFF0", // Мёртвенно-белый
    "#98FB98", // Светло-зелёный
    "#AFEEEE", // Бледно-турецкий
    "#00FFFF", // Циан
    "#00CED1", // Тёмно-бирюзовый
    "#40E0D0", // Бирюзовый
    "#00BFFF", // Голубой
    "#87CEEB"  // Светло-голубой
]

const Avatar: React.FC<InnerProps> = ({ color, fontSize, smallTitle, width, height, fullName }) => {
    const hash = parseInt(md5(fullName).slice(0, 8), 16)
    const backgroud = backgroudColors[hash % backgroudColors.length]
    return (
        <div
            style={
                {
                    display: 'flex',
                    width: width, height: height, borderRadius: '50%',
                    alignItems: 'center', fontWeight: 'bold',
                    alignContent: 'center', background: backgroud,
                    justifyContent: 'center', justifyItems: 'center',
                    fontSize: fontSize, color: color,
                }}
        >
            {smallTitle.toUpperCase()}
        </div>
    );
};


export const BigAvatar: React.FC<IProps> = ({ smallTitle, fullName }) => {
    return (
        <>
            <Avatar
                fontSize='32px'
                smallTitle={smallTitle}
                width='92px'
                height='92px'
                color='white'
                fullName={fullName}
            />
        </>
    );
};

export const MediumAvatar: React.FC<IProps> = ({ smallTitle, fullName }) => {
    return (
        <>
            <Avatar
                fontSize='20px'
                smallTitle={smallTitle}
                width='54px'
                height='54px'
                color='white'
                fullName={fullName}
            />
        </>
    );
};

export const SmallAvatar: React.FC<IProps> = ({ smallTitle, fullName }) => {
    return (
        <>
            <Avatar
                fontSize='16px'
                smallTitle={smallTitle}
                width='32px'
                height='32px'
                color='white'
                fullName={fullName}
            />
        </>
    );
};
