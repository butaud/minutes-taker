import React, { Fragment, useEffect } from 'react';
import { NewTopicNode, TopicNode } from './nodes/topic/TopicNode';
import { AttendanceNode } from './nodes/attendance/AttendanceNode';
import './SessionEditor.css';
import { StoredSession } from '../store/types';
import { SessionHeaderNode } from './nodes/header/SessionHeaderNode';
import { InsertingContext } from './context/InsertingContext';
import { initializeIndexedDbBackup } from '../fs/io';
import { CallerNode } from './nodes/caller/CallerNode';
import { CalendarNode } from './nodes/calendar/CalendarNode';
import { CommitteeSection } from './nodes/committee/CommitteeSection';
import { ActionItemsSection } from './nodes/listed-action-items/ActionItemsSection';
import { FileMenu } from './file-menu/FileMenu';

export const SessionEditor: React.FC<{ session: StoredSession }> = ({ session }) => {
	const [ isInserting, setIsInserting ] = React.useState(false);

	useEffect(() => {
		initializeIndexedDbBackup();
	}, []);

	return (
		<InsertingContext.Provider value={isInserting}>
			<div>
				<FileMenu setInserting={setIsInserting} />
				<SessionHeaderNode metadata={session.metadata} />
				<AttendanceNode
					present={session.metadata.membersPresent}
					absent={session.metadata.membersAbsent}
					administrationPresent={session.metadata.administrationPresent}
				/>
				<CalendarNode calendar={session.calendar} />
				<CallerNode caller={session.metadata.caller} />
				<ul>
					{session.topics.map((topic, index) => (
						<Fragment key={topic.id}>
							{isInserting && <NewTopicNode miniature beforeIndex={index} />}
							<TopicNode topic={topic} />
						</Fragment>
					))}
					<NewTopicNode miniature={false} />
				</ul>
				<CommitteeSection committees={session.committees} committeeDocUrl={session.metadata.committeeDocUrl} />
				<ActionItemsSection pastActionItems={session.pastActionItems} topics={session.topics} />
			</div>
		</InsertingContext.Provider>
	);
};
