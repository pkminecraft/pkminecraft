/*jslint node: true,nomen: true */
/*globals exports */

"use strict";

exports.core_active_droplets = [ {
    "id": 1001,
    "name": 'test1.paulkimbrel.com',
    "memory": 512,
    "vcpus": 1,
    "disk": 20,
    "locked": false,
    "status": 'active',
    "kernel": {
        id: 1,
        name: 'Ubuntu 14.04 x64 vmlinuz-3.13.0-24-generic (1221)',
        version: '3.13.0-24-generic'
    },
    "created_at": '2014-05-16T02:25:18Z',
    "features": [ 'virtio' ],
    "backup_ids": [],
    "next_backup_window": null,
    "snapshot_ids": [ 1 ],
    "image": {
        "id": 1,
        "name": 'test-server1',
        "distribution": 'Ubuntu',
        "slug": null,
        "public": false,
        "regions": [ 'nyc2' ],
        "created_at": '2014-05-16T01:30:50Z',
        "min_disk_size": 20
    },
    "size": {
        "slug": '512mb',
        "memory": 512,
        "vcpus": 1,
        "disk": 20,
        "transfer": 1,
        "price_monthly": 5,
        "price_hourly": 0.00744,
        "regions": [
            'nyc1',
            'sgp1',
            'ams1',
            'ams2',
            'sfo1',
            'nyc2',
            'lon1',
            'nyc3',
            'ams3'
        ],
        "available": true
    },
    "size_slug": '512mb',
    "networks": {
        "v4": [ {
            ip_address: '192.168.1.101',
            netmask: '255.255.255.0',
            gateway: '192.168.1.1',
            type: 'private'
        } ],
        "v6": []
    },
    "region": {
        "name": 'New York 2',
        "slug": 'nyc2',
        "sizes": [],
        "features": [ 'virtio', 'private_networking', 'backups' ],
        "available": null
    }
} ];
