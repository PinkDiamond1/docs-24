/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    main: [
        'home',
        {
            type: 'category',
            label: 'Getting Started',
            collapsed: false,
            items: [
                {type: 'autogenerated', dirName: 'get-started'}
            ]
        },
        {
            type: 'category',
            label: 'Guides',
            collapsed: false,
            items: [
                {type: 'autogenerated', dirName: 'guides'}
            ]
        },
        {
            type: 'category',
            label: 'Explanations',
            collapsed: false,
            items: [
                {type: 'autogenerated', dirName: 'explanations'}
            ]
        },
        {
            type: 'category',
            label: 'Reference',
            collapsed: false,
            items: [
                {type: 'autogenerated', dirName: 'reference'}
            ]
        },
        {
            type: 'link',
            label: 'Kurtosis Packages',
            href: 'https://github.com/kurtosis-tech?q=package&type=all&language=&sort=',
        },
        {
            type: 'link',
            label: 'Changelog',
            href: 'https://docs.kurtosistech.com/kurtosis/changelog',
        },
    ],

    api: [
        'api/kurtosis-core',
        'api/kurtosis-engine'
    ]
};

module.exports = sidebars;
