"use client";
import React, { useState } from 'react';
import LoadVideos from '../video/LoadVideos';
import LoadTweets from '../tweet/LoadTweets';
import { X, Search } from 'lucide-react';
import LoadUsers from '../user/LoadUsers';

const SearchPage: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState<'videos' | 'tweets' | 'users'>('videos');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setQuery(e.target.value);
    };

    const handleClear = () => {
        setInputValue('');
        setQuery('');
    };

    const handleSubmit = () => {
        setQuery(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };

    const tabs = [
        { key: 'videos', label: 'Videos' },
        { key: 'tweets', label: 'Tweets' },
        { key: 'users', label: 'Users' },
    ] as const;

    return (
        <>
            {/* Search bar */}
            <div className="flex justify-center items-center px-4 pt-5 pb-3">
                <div className="relative w-full md:w-[70%] flex items-center gap-2">
                    <div className="relative flex-1">
                        {/* Search icon inside input */}
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />

                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Search..."
                            className="w-full pl-10 pr-10 py-2.5 rounded-full text-sm
                                bg-slate-100 dark:bg-slate-800/60
                                border border-slate-200 dark:border-slate-700/50
                                text-slate-900 dark:text-slate-100
                                placeholder:text-slate-400 dark:placeholder:text-slate-500
                                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600
                                transition-all duration-200"
                        />

                        {/* Clear button */}
                        {inputValue && (
                            <button
                                onClick={handleClear}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Search button */}
                    <button
                        onClick={handleSubmit}
                        className="shrink-0 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full p-2.5 hover:opacity-80 active:scale-95 transition-all duration-150 shadow-sm"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Tab bar — matching UserProfile style */}
            <div className="border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center px-1 sm:px-3">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setSelected(tab.key)}
                            className={`relative px-4 sm:px-6 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus:outline-none
                                ${selected === tab.key
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {tab.label}
                            <span
                                className={`absolute bottom-0 inset-x-0 h-[2.5px] rounded-full transition-all duration-300
                                    ${selected === tab.key
                                        ? 'bg-slate-900 dark:bg-slate-100 opacity-100'
                                        : 'opacity-0'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="mt-2">
                {selected === 'videos' && <LoadVideos query={query} />}
                {selected === 'tweets' && <LoadTweets query={query} />}
                {selected === 'users' && <LoadUsers query={query} />}
            </div>
        </>
    );
};

export default SearchPage;
