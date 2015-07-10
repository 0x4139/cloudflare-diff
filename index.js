'use strict';
var CloudflareAPI = require('cloudflare-api');

var dns_zone = require('./dnsZone.json');
var client = new CloudflareAPI({
    email: process.env.EMAIL,
    token: process.env.TOKEN
});

client.execute({
    a: 'rec_load_all',
    z: process.env.DOMAIN,
    type: 'A'
}).then(function (result) {

    //update what is necessary
		if(result.response.recs.objs)
    result.response.recs.objs.forEach(function (record) {
        if (dns_zone[record.display_name] && dns_zone[record.display_name] != record.content) {
            console.log('updating ', record.display_name);
            client.execute({
                a: 'rec_edit',
                id: record.rec_id,
                z: process.env.DOMAIN,
                content: dns_zone[record.display_name],
                type: 'A',
                name: record.display_name,
                ttl: '120'
            }).catch(console.log);
        }
        delete dns_zone[record.display_name];
    });
    //insert what is new;
    for (var subdomain in dns_zone) {
        if (dns_zone.hasOwnProperty(subdomain)) {
            console.log('inserting ', subdomain);
            client.execute({
                a: 'rec_new',
                z: process.env.DOMAIN,
                content: dns_zone[subdomain],
                type: 'A',
                name: subdomain,
                ttl: '120'
            }).catch(console.log);
        }
    }
});
