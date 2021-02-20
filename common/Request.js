'use strict'
const fetch = require('node-fetch')

class Request {
    static async get(url) {
        return await fetch(url, {
            method: 'GET',
        })
            .then((res) => res.json())
            .then((res) => {
                if (!res || res.error_code != 0) {
                    return null
                }
                return res
            })
            .catch((e) => {
                console.error(e)
                return null
            });
    }

    static async post(url, data) {
        return await fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            data: data,
            headers: { 'Content-Type': 'application/json' },
        })
            .then((res) => res.text())
            .then((res) => {
                if (!res || res.code != 200) {
                    console.error(res)
                    return null
                }
                return res
            })
            .catch((e) => {
                console.error(e)
                return null
            })
    }
}

module.exports = Request
