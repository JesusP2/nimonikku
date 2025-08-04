import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit3, Plus } from "lucide-react";
import { useQuery, useStore } from "@livestore/react";
import { events } from "@/server/livestore/schema";
import { allDecks$, allCards$ } from "@/lib/livestore/queries";
import { DeckActionsMenu } from "@/components/deck-actions-menu";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
});

interface Deck {
	id: string;
	userId: string;
	private?: number | null;
	name: string;
	description?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

interface CardType {
	id: string;
	deckId: string;
	frontMarkdown: string;
	backMarkdown: string;
	frontFiles: string;
	backFiles: string;
	due: Date;
	stability: number;
	difficulty: number;
	rating: number;
	elapsed_days: number;
	scheduled_days: number;
	reps: number;
	lapses: number;
	state: number;
	last_review?: Date;
	createdAt: Date;
	updatedAt: Date;
}

function AdminPage() {
	const { store } = useStore();
	const decks = useQuery(allDecks$) || [];
	const cards = useQuery(allCards$) || [];

	const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
	const [editingCard, setEditingCard] = useState<CardType | null>(null);
	const [showNewDeck, setShowNewDeck] = useState(false);
	const [showNewCard, setShowNewCard] = useState(false);

	const createDeck = (
		deckData: Omit<Deck, "id" | "createdAt" | "updatedAt">,
	) => {
		const now = new Date();
		const id = crypto.randomUUID();

		store.commit(
			events.deckCreated({
				id,
				userId: deckData.userId,
				private: deckData.private ?? 0,
				name: deckData.name,
				description: deckData.description ?? "",
				createdAt: now,
				updatedAt: now,
			}),
		);
	};

	const updateDeck = (
		id: string,
		updates: Partial<Pick<Deck, "name" | "description" | "private">>,
	) => {
		store.commit(events.deckUpdated({
			id,
			...updates,
			updatedAt: new Date(),
		}));
	};

	const deleteDeck = (id: string) => {
          store.commit(events.deckDeleted({ id }))
	};

	const createCard = (
		cardData: Omit<CardType, "id" | "createdAt" | "updatedAt">,
	) => {
		const now = new Date();
		const id = crypto.randomUUID();

		store.commit(events.cardCreated({
			id,
			deckId: cardData.deckId,
			frontMarkdown: cardData.frontMarkdown,
			backMarkdown: cardData.backMarkdown,
			frontFiles: cardData.frontFiles,
			backFiles: cardData.backFiles,
			due: cardData.due,
			stability: cardData.stability,
			difficulty: cardData.difficulty,
			rating: cardData.rating,
			elapsed_days: cardData.elapsed_days,
			scheduled_days: cardData.scheduled_days,
			reps: cardData.reps,
			lapses: cardData.lapses,
			state: cardData.state,
			last_review: cardData.last_review,
			createdAt: now,
			updatedAt: now,
		}));
	};

	const updateCard = (
		id: string,
		updates: Partial<
			Pick<
				CardType,
				"frontMarkdown" | "backMarkdown" | "frontFiles" | "backFiles"
			>
		>,
	) => {
		store.commit(events.cardUpdated({
			id,
			...updates,
			updatedAt: new Date(),
		}));
	};

	const deleteCard = (id: string) => {
		store.commit(events.cardDeleted({ id }));
	};

	return (
		<div className="max-w-7xl mx-auto p-6">
			<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

			<Tabs defaultValue="decks" className="w-full">
				<TabsContent value="decks" className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold">Decks</h2>
						<Button onClick={() => setShowNewDeck(true)}>
							<Plus className="w-4 h-4 mr-2" />
							New Deck
						</Button>
					</div>

					{showNewDeck && (
						<DeckForm
							onSubmit={(data) => {
								createDeck(data);
								setShowNewDeck(false);
							}}
							onCancel={() => setShowNewDeck(false)}
						/>
					)}
					{editingDeck && (
						<DeckForm
							deck={editingDeck}
							onSubmit={(data) => {
								updateDeck(editingDeck.id, data);
								setEditingDeck(null);
							}}
							onCancel={() => setEditingDeck(null)}
						/>
					)}

					<div className="grid gap-4">
						{decks.map((deck) => (
							<Card key={deck.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<div>
											<CardTitle>{deck.name}</CardTitle>
											<CardDescription>{deck.description}</CardDescription>
										</div>
										<div className="flex items-center gap-2">
											{deck.private && (
												<Badge variant="secondary">Private</Badge>
											)}
											<DeckActionsMenu deck={deck} />
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										Cards:{" "}
										{
											cards.filter((card: any) => card.deckId === deck.id)
												.length
										}
									</p>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value="cards" className="space-y-4">
					<div className="flex justify-between items-center">
						<h2 className="text-2xl font-semibold">Cards</h2>
						<Button onClick={() => setShowNewCard(true)}>
							<Plus className="w-4 h-4 mr-2" />
							New Card
						</Button>
					</div>

					{showNewCard && (
						<CardForm
							decks={decks}
							onSubmit={(data) => {
								createCard(data);
								setShowNewCard(false);
							}}
							onCancel={() => setShowNewCard(false)}
						/>
					)}
					{editingCard && (
						<CardForm
							card={editingCard}
							decks={decks}
							onSubmit={(data) => {
								updateCard(editingCard.id, data);
								setEditingCard(null);
							}}
							onCancel={() => setEditingCard(null)}
						/>
					)}

					<div className="grid gap-4">
						{cards.map((card: any) => {
							const deck = decks.find((d: any) => d.id === card.deckId);
							return (
								<Card key={card.id}>
									<CardHeader>
										<div className="flex justify-between items-start">
											<div>
												<CardTitle className="text-base">
													{deck?.name || "Unknown Deck"}
												</CardTitle>
												<CardDescription>
													Front: {card.frontMarkdown.substring(0, 100)}...
												</CardDescription>
											</div>
											<div className="flex gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => setEditingCard(card)}
												>
													<Edit3 className="w-4 h-4" />
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => deleteCard(card.id)}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground mb-2">
											Back: {card.backMarkdown.substring(0, 100)}...
										</p>
										<div className="flex gap-2 text-xs text-muted-foreground">
											<span>Reviews: {card.reps}</span>
											<span>Difficulty: {card.difficulty}</span>
											<span>Due: {card.due?.toLocaleDateString()}</span>
										</div>
									</CardContent>
								</Card>
							);
						})}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}

function DeckForm({
	deck,
	onSubmit,
	onCancel,
}: {
	deck?: Deck;
	onSubmit: (data: Omit<Deck, "id" | "createdAt" | "updatedAt">) => void;
	onCancel: () => void;
}) {
	const [formData, setFormData] = useState({
		name: deck?.name || "",
		description: deck?.description || "",
		private: deck?.private || 0,
		userId: deck?.userId || "user-1",
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{deck ? "Edit Deck" : "New Deck"}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Name</Label>
						<Input
							id="name"
							value={formData.name}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, name: e.target.value }))
							}
							required
						/>
					</div>
					<div>
						<Label htmlFor="description">Description</Label>
						<Textarea
							id="description"
							value={formData.description}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									description: e.target.value,
								}))
							}
						/>
					</div>
					<div>
						<Label htmlFor="private">Private</Label>
						<select
							id="private"
							value={formData.private}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									private: Number(e.target.value),
								}))
							}
							className="w-full p-2 border rounded"
						>
							<option value={0}>Public</option>
							<option value={1}>Private</option>
						</select>
					</div>
					<div className="flex gap-2">
						<Button type="submit">{deck ? "Update" : "Create"}</Button>
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}

function CardForm({
	card,
	decks,
	onSubmit,
	onCancel,
}: {
	card?: CardType;
	decks: readonly any[];
	onSubmit: (data: Omit<CardType, "id" | "createdAt" | "updatedAt">) => void;
	onCancel: () => void;
}) {
	const [formData, setFormData] = useState({
		deckId: card?.deckId || decks[0]?.id || "",
		frontMarkdown: card?.frontMarkdown || "",
		backMarkdown: card?.backMarkdown || "",
		frontFiles: card?.frontFiles || "",
		backFiles: card?.backFiles || "",
		due: card?.due || new Date(),
		stability: card?.stability || 1,
		difficulty: card?.difficulty || 1,
		rating: card?.rating || 0,
		elapsed_days: card?.elapsed_days || 0,
		scheduled_days: card?.scheduled_days || 1,
		reps: card?.reps || 0,
		lapses: card?.lapses || 0,
		state: card?.state || 0,
		last_review: card?.last_review,
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formData);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>{card ? "Edit Card" : "New Card"}</CardTitle>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="deckId">Deck</Label>
						<select
							id="deckId"
							value={formData.deckId}
							onChange={(e) =>
								setFormData((prev) => ({ ...prev, deckId: e.target.value }))
							}
							className="w-full p-2 border rounded"
							required
						>
							{decks.map((deck) => (
								<option key={deck.id} value={deck.id}>
									{deck.name}
								</option>
							))}
						</select>
					</div>
					<div>
						<Label htmlFor="frontMarkdown">Front Content</Label>
						<Textarea
							id="frontMarkdown"
							value={formData.frontMarkdown}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									frontMarkdown: e.target.value,
								}))
							}
							required
						/>
					</div>
					<div>
						<Label htmlFor="backMarkdown">Back Content</Label>
						<Textarea
							id="backMarkdown"
							value={formData.backMarkdown}
							onChange={(e) =>
								setFormData((prev) => ({
									...prev,
									backMarkdown: e.target.value,
								}))
							}
							required
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<Label htmlFor="difficulty">Difficulty</Label>
							<Input
								id="difficulty"
								type="number"
								value={formData.difficulty}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										difficulty: Number(e.target.value),
									}))
								}
							/>
						</div>
						<div>
							<Label htmlFor="stability">Stability</Label>
							<Input
								id="stability"
								type="number"
								value={formData.stability}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										stability: Number(e.target.value),
									}))
								}
							/>
						</div>
					</div>
					<div className="flex gap-2">
						<Button type="submit">{card ? "Update" : "Create"}</Button>
						<Button type="button" variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
}
