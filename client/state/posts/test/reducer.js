/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	POST_RECEIVE,
	POSTS_RECEIVE,
	POSTS_REQUEST,
	POSTS_REQUEST_FAILURE,
	POSTS_REQUEST_SUCCESS
} from 'state/action-types';
import { items, sitePosts, siteQueries } from '../reducer';

describe( 'reducer', () => {
	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index posts by global ID', () => {
			const state = items( null, {
				type: POST_RECEIVE,
				post: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
		} );

		it( 'should index multiple posts by global ID', () => {
			const state = items( null, {
				type: POSTS_RECEIVE,
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
					{ ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
				]
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should accumulate posts', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' },
				'6c831c187ffef321eb43a67761a525a3': { ID: 413, site_ID: 2916284, global_ID: '6c831c187ffef321eb43a67761a525a3', title: 'Ribs & Chicken' }
			} );
		} );

		it( 'should override previous post of same ID', () => {
			const original = Object.freeze( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );
			const state = items( original, {
				type: POST_RECEIVE,
				post: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				'3d097cb7c5473c169bba0eb8e3c6cb64': { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Ribs & Chicken' }
			} );
		} );
	} );

	describe( '#sitePosts()', () => {
		it( 'should default to an empty object', () => {
			const state = sitePosts( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should map site ID, post ID pair to global ID', () => {
			const state = sitePosts( null, {
				type: POST_RECEIVE,
				post: { ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					841: '3d097cb7c5473c169bba0eb8e3c6cb64'
				}
			} );
		} );
	} );

	describe( '#siteQueries()', () => {
		it( 'should default to an empty object', () => {
			const state = siteQueries( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track site post query request fetching', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"Hello"}': {
						fetching: true
					}
				}
			} );
		} );

		it( 'should accumulate site queries', () => {
			const original = Object.freeze( {
				2916284: {
					'{"search":"Hello"}': {
						fetching: true
					}
				}
			} );
			const state = siteQueries( original, {
				type: POSTS_REQUEST,
				siteId: 2916284,
				query: { search: 'Hello W' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"Hello"}': {
						fetching: true
					},
					'{"search":"Hello W"}': {
						fetching: true
					}
				}
			} );
		} );

		it( 'should track site post query request success', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST_SUCCESS,
				siteId: 2916284,
				query: { search: 'Hello' },
				posts: [
					{ ID: 841, site_ID: 2916284, global_ID: '3d097cb7c5473c169bba0eb8e3c6cb64', title: 'Hello World' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"Hello"}': {
						fetching: false,
						posts: [ '3d097cb7c5473c169bba0eb8e3c6cb64' ]
					}
				}
			} );
		} );

		it( 'should track site post query request failure', () => {
			const state = siteQueries( null, {
				type: POSTS_REQUEST_FAILURE,
				siteId: 2916284,
				query: { search: 'Hello' },
				error: new Error()
			} );

			expect( state ).to.eql( {
				2916284: {
					'{"search":"Hello"}': {
						fetching: false
					}
				}
			} );
		} );
	} );
} );
